export interface EventData {
  id: string;
  title: string;
  description: string;
  location: number[]; // [lat, lng]
  date: string;
  district: string;
  image_url: string;
  ref_url: string[];
}
