"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from "ol/style";
import OSM from "ol/source/OSM";
import { fromLonLat, toLonLat } from "ol/proj";
import { MapControls } from "./map-controls";
import Cluster from "ol/source/Cluster";
import { Drawer } from "./drawer";
import { YearSlider } from "./year-slider";
import { useStore } from "@/lib/use-store";

interface EventData {
  title: string;
  description: string;
  location: [number, number];
  date: string;
  district: string;
  image_url: string;
  ref_url: string[];
}

interface EventFeature extends Feature {
  get(key: string): EventData | Feature[] | undefined;
  getProperties(): EventData;
}

// debounce 함수
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function MobileMap() {
  const { events, setEvents, setExpanded } = useStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const locationSourceRef = useRef<VectorSource | null>(null);
  const locationFeatureRef = useRef<Feature | null>(null);
  const clusterSourceRef = useRef<Cluster | null>(null);
  const [loading, setLoading] = useState(false);

  // 모든 이벤트의 연도 범위 계산 (초기값 설정)
  const [minYear, setMinYear] = useState(1800);
  const [maxYear, setMaxYear] = useState(new Date().getFullYear());
  const [yearRange, setYearRange] = useState<[number, number]>([
    1800,
    new Date().getFullYear(),
  ]);

  // 백엔드에서 이벤트 데이터 가져오기
  const fetchEvents = useCallback(
    async (extent: number[], yearRange: [number, number]) => {
      try {
        setLoading(true);
        const response = await fetch("/api/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            extent,
            yearRange,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();
        setEvents(data.events);

        // 연도 범위 업데이트
        if (data.minYear && data.maxYear) {
          setMinYear(data.minYear);
          setMaxYear(data.maxYear);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    },
    [setEvents]
  );

  // 지도 extent 계산 함수
  const getMapExtent = useCallback(() => {
    if (!map) return null;

    const view = map.getView();
    const extent = view.calculateExtent(map.getSize());

    // OpenLayers extent를 경위도로 변환
    const bottomLeft = toLonLat([extent[0], extent[1]]);
    const topRight = toLonLat([extent[2], extent[3]]);

    return [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]]; // [minLon, minLat, maxLon, maxLat]
  }, [map]);

  // debounced fetch 함수
  const debouncedFetchEvents = useCallback(
    debounce((extent: number[], yearRange: [number, number]) => {
      fetchEvents(extent, yearRange);
    }, 300), // 300ms debounce
    [fetchEvents]
  );

  // 지도 extent 변경 감지 및 데이터 로드
  const handleExtentChange = useCallback(() => {
    const extent = getMapExtent();
    if (extent) {
      debouncedFetchEvents(extent, yearRange);
    }
  }, [getMapExtent, debouncedFetchEvents, yearRange]);

  // 연도 범위 변경 핸들러
  const handleYearChange = useCallback(
    (range: [number, number]) => {
      setYearRange(range);
      // 새로운 연도 범위로 서버에서 데이터 다시 가져오기
      const extent = getMapExtent();
      if (extent) {
        debouncedFetchEvents(extent, range);
      }
    },
    [getMapExtent, debouncedFetchEvents]
  );

  // 위치 표시 스타일 설정
  const createLocationStyle = useCallback(() => {
    return new Style({
      text: new Text({
        text: "🐾", // 귀여운 발바닥 이모지
        font: "24px Arial",
        fill: new Fill({
          color: "#000000",
        }),
        stroke: new Stroke({
          color: "#ffffff",
          width: 3,
        }),
        offsetY: -12, // 위치를 약간 위로 조정
      }),
      image: new CircleStyle({
        radius: 12,
        fill: new Fill({
          color: "rgba(255, 182, 193, 0.3)", // 연한 핑크 배경
        }),
        stroke: new Stroke({
          color: "#ff69b4", // 핑크 테두리
          width: 2,
        }),
      }),
    });
  }, []);

  // 이벤트 마커 스타일 설정
  const createEventStyle = useCallback((feature: Feature) => {
    const size = feature.get("features")?.length ?? 1;
    return new Style({
      image: new CircleStyle({
        radius: size > 1 ? Math.min(size * 3, 20) : 6,
        fill: new Fill({
          color: "#3b82f6",
        }),
        stroke: new Stroke({
          color: "#ffffff",
          width: 2,
        }),
      }),
      text:
        size > 1
          ? new Text({
              text: size.toString(),
              fill: new Fill({
                color: "#ffffff",
              }),
            })
          : undefined,
    });
  }, []);

  // 위치 업데이트 함수
  const updateLocation = useCallback(() => {
    if (!map || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = fromLonLat([longitude, latitude]);

        if (!locationFeatureRef.current) {
          locationFeatureRef.current = new Feature({
            geometry: new Point(location),
          });
          locationFeatureRef.current.setStyle(createLocationStyle());

          if (!locationSourceRef.current) {
            locationSourceRef.current = new VectorSource({
              features: [locationFeatureRef.current],
            });

            const vectorLayer = new VectorLayer({
              source: locationSourceRef.current,
              zIndex: 2,
            });

            map.addLayer(vectorLayer);
          }
        } else {
          const locationGeom =
            locationFeatureRef.current.getGeometry() as Point;
          locationGeom.setCoordinates(location);
        }
      },
      (error) => {
        console.log("위치를 가져올 수 없습니다:", error);
      }
    );
  }, [map, createLocationStyle]);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || map) return; // map이 이미 있으면 초기화하지 않음

    // 서울 좌표 (경도, 위도)
    const seoul = fromLonLat([126.9779, 37.5665]);

    // 빈 클러스터 소스 생성 (데이터는 나중에 로드)
    const clusterSource = new Cluster({
      distance: 40,
      source: new VectorSource({
        features: [], // 빈 배열로 시작
      }),
    });
    clusterSourceRef.current = clusterSource;

    // 클러스터 레이어 생성
    const clusterLayer = new VectorLayer({
      source: clusterSource,
      style: createEventStyle as any,
      zIndex: 1,
    });

    const mapInstance = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        clusterLayer,
      ],
      view: new View({
        center: seoul,
        zoom: 12,
      }),
    });

    // 클릭 이벤트 처리
    mapInstance.on("click", (e) => {
      const feature = mapInstance.forEachFeatureAtPixel(
        e.pixel,
        (feature) => feature
      ) as EventFeature;
      if (feature) {
        const features = feature.get("features") as Feature[];
        setEvents(features.map((f) => f.getProperties() as EventData));
        setExpanded(true);
      } else {
        // 빈 공간을 클릭했을 때 drawer 닫기
        setEvents([]);
        setExpanded(false);
      }
    });

    setMap(mapInstance);

    return () => {
      mapInstance.setTarget(undefined);
      setMap(null);
    };
  }, [createEventStyle]); // 의존성을 최소화

  // 지도가 생성된 후 이벤트 리스너 등록
  useEffect(() => {
    if (!map) return;

    // 지도 움직임 감지 (moveend 이벤트)
    map.on("moveend", handleExtentChange);

    // 초기 데이터 로드
    const initialExtent = map.getView().calculateExtent(map.getSize());
    if (initialExtent) {
      const bottomLeft = toLonLat([initialExtent[0], initialExtent[1]]);
      const topRight = toLonLat([initialExtent[2], initialExtent[3]]);
      const extent = [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]];
      fetchEvents(extent, yearRange);
    }

    return () => {
      map.un("moveend", handleExtentChange);
    };
  }, [map, handleExtentChange, fetchEvents, yearRange]);

  // events 상태가 변경될 때마다 지도 업데이트
  useEffect(() => {
    if (!clusterSourceRef.current || !events.length) return;

    const features = events.map((event) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([event.location[1], event.location[0]])),
        ...event,
      });
      return feature;
    });

    const source = clusterSourceRef.current.getSource() as VectorSource;
    source.clear();
    source.addFeatures(features);
  }, [events]);

  // 위치 추적 설정
  useEffect(() => {
    if (!map) return;

    // 최초 위치 요청
    updateLocation();

    // 1초마다 위치 업데이트
    const intervalId = setInterval(updateLocation, 1000);

    return () => {
      clearInterval(intervalId);
      locationFeatureRef.current = null;
      locationSourceRef.current = null;
    };
  }, [map, updateLocation]);

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-screen" />
      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-foreground">이벤트 로딩 중...</span>
          </div>
        </div>
      )}
      <MapControls map={map} className="absolute top-4 right-4" />
      <YearSlider
        className="absolute bottom-20 right-4"
        minYear={minYear}
        maxYear={maxYear}
        value={yearRange}
        onValueChange={handleYearChange}
      />
      <Drawer />
    </div>
  );
}
