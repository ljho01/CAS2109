"use client"

import { useEffect, useRef, useState, useCallback  } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'
import { MapControls } from './map-controls'
import 'ol/ol.css'
import Cluster from 'ol/source/Cluster'
import { Drawer } from "@/components/ui/drawer"
import { EventDrawer } from './event-drawer'
import { YearSlider } from './year-slider'
import events from '@/events.json'

interface EventData {
  title: string;
  description: string;
  location: [number, number];
  date: string;
  image?: string;
}

interface EventFeature extends Feature {
  get(key: string): EventData | Feature[] | undefined;
  getProperties(): EventData;
}

export function MobileMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<Map | null>(null)
  const locationSourceRef = useRef<VectorSource | null>(null)
  const locationFeatureRef = useRef<Feature | null>(null)
  const [selectedEvents, setSelectedEvents] = useState<EventData[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const clusterSourceRef = useRef<Cluster | null>(null)

  // 모든 이벤트의 연도 범위 계산
  const years = events.map(event => new Date(event.date).getFullYear());
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const [yearRange, setYearRange] = useState<[number, number]>([minYear, maxYear]);

  // 이벤트 필터링 함수
  const filterEvents = useCallback((range: [number, number]) => {
    if (!clusterSourceRef.current) return;
    
    const filteredFeatures = events
      .filter(event => {
        const eventYear = new Date(event.date).getFullYear();
        return eventYear >= range[0] && eventYear <= range[1];
      })
      .map(event => new Feature({
        geometry: new Point(fromLonLat([event.location[1], event.location[0]])),
        ...event
      }));

    const source = clusterSourceRef.current.getSource() as VectorSource;
    source.clear();
    source.addFeatures(filteredFeatures);
  }, []);

  // 연도 범위 변경 핸들러
  const handleYearChange = useCallback((range: [number, number]) => {
    setYearRange(range);
    filterEvents(range);
  }, [filterEvents]);

  // 위치 표시 스타일 설정
  const createLocationStyle = useCallback(() => {
    return new Style({
      image: new CircleStyle({
        radius: 8,
        fill: new Fill({
          color: '#3b82f6'
        }),
        stroke: new Stroke({
          color: '#ffffff',
          width: 2
        })
      })
    })
  }, [])

  // 이벤트 마커 스타일 설정
  const createEventStyle = useCallback((feature: Feature) => {
    const size = feature.get('features')?.length ?? 1;
    return new Style({
      image: new CircleStyle({
        radius: size > 1 ? Math.min(size * 3, 20) : 6,
        fill: new Fill({
          color: '#3b82f6'
        }),
        stroke: new Stroke({
          color: '#ffffff',
          width: 2
        })
      }),
      text: size > 1 ? new Text({
        text: size.toString(),
        fill: new Fill({
          color: '#ffffff'
        })
      }) : undefined
    })
  }, [])

  // 위치 업데이트 함수
  const updateLocation = useCallback(() => {
    if (!map || !navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const location = fromLonLat([longitude, latitude])

        if (!locationFeatureRef.current) {
          locationFeatureRef.current = new Feature({
            geometry: new Point(location)
          })
          locationFeatureRef.current.setStyle(createLocationStyle())
          
          if (!locationSourceRef.current) {
            locationSourceRef.current = new VectorSource({
              features: [locationFeatureRef.current]
            })
            
            const vectorLayer = new VectorLayer({
              source: locationSourceRef.current,
              zIndex: 2
            })
            
            map.addLayer(vectorLayer)
          }
        } else {
          const locationGeom = locationFeatureRef.current.getGeometry() as Point
          locationGeom.setCoordinates(location)
        }
      },
      (error) => {
        console.error('위치를 가져올 수 없습니다:', error)
      }
    )
  }, [map, createLocationStyle])

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current) return

    // 서울 좌표 (경도, 위도)
    const seoul = fromLonLat([126.9779, 37.5665])

    // 이벤트 데이터로 피처 생성
    const features = events.map(event => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([event.location[1], event.location[0]])),
        ...event
      })
      return feature
    })

    // 클러스터 소스 생성
    const clusterSource = new Cluster({
      distance: 40,
      source: new VectorSource({
        features: features
      })
    })
    clusterSourceRef.current = clusterSource;

    // 클러스터 레이어 생성
    const clusterLayer = new VectorLayer({
      source: clusterSource,
      style: createEventStyle as any,
      zIndex: 1
    })

    const mapInstance = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        clusterLayer
      ],
      view: new View({
        center: seoul,
        zoom: 12,
      }),
    })

    // 클릭 이벤트 처리
    mapInstance.on('click', (e) => {
      const feature = mapInstance.forEachFeatureAtPixel(e.pixel, (feature) => feature) as EventFeature;
      if (feature) {
        const features = feature.get('features') as Feature[];
        setSelectedEvents(features.map(f => f.getProperties() as EventData));
          setDrawerOpen(true);
      }
    });

    setMap(mapInstance)

    return () => {
      mapInstance.setTarget(undefined)
      setMap(null)
    }
  }, [createEventStyle])

  // 위치 추적 설정
  useEffect(() => {
    if (!map) return

    // 최초 위치 요청
    updateLocation()

    // 1초마다 위치 업데이트
    const intervalId = setInterval(updateLocation, 1000)

    return () => {
      clearInterval(intervalId)
      locationFeatureRef.current = null
      locationSourceRef.current = null
    }
  }, [map, updateLocation])

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-[calc(100vh-64px)]"
      />
      <MapControls 
        map={map}
        className="absolute top-4 right-4"
      />
      <YearSlider
        className="absolute bottom-20 right-4"
        minYear={minYear}
        maxYear={maxYear}
        value={yearRange}
        onValueChange={handleYearChange}
      />
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <EventDrawer events={selectedEvents} />
      </Drawer>
    </div>
  )
} 