// Geo-hierarchy data for TOAGOSEI
export const geoHierarchy = {
  countries: ['India'],
  states: {
    'India': ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Telangana', 'Haryana'],
  },
  zones: {
    'Delhi': ['North Zone', 'South Zone', 'East Zone', 'West Zone'],
    'Maharashtra': ['Mumbai Zone', 'Pune Zone', 'Nagpur Zone'],
    'Karnataka': ['Bangalore Zone', 'Mysore Zone'],
    'Tamil Nadu': ['Chennai Zone', 'Coimbatore Zone'],
    'Gujarat': ['Ahmedabad Zone', 'Surat Zone'],
    'Rajasthan': ['Jaipur Zone', 'Udaipur Zone'],
    'Uttar Pradesh': ['Lucknow Zone', 'Noida Zone', 'Varanasi Zone'],
    'West Bengal': ['Kolkata Zone'],
    'Telangana': ['Hyderabad Zone'],
    'Haryana': ['Gurgaon Zone', 'Faridabad Zone'],
  },
  cities: {
    'North Zone': ['New Delhi', 'Rohini', 'Pitampura'],
    'South Zone': ['Saket', 'Vasant Kunj', 'Hauz Khas'],
    'East Zone': ['Preet Vihar', 'Laxmi Nagar'],
    'West Zone': ['Rajouri Garden', 'Janakpuri'],
    'Mumbai Zone': ['Mumbai', 'Thane', 'Navi Mumbai'],
    'Pune Zone': ['Pune', 'Pimpri-Chinchwad'],
    'Nagpur Zone': ['Nagpur'],
    'Bangalore Zone': ['Bangalore', 'Electronic City'],
    'Mysore Zone': ['Mysore'],
    'Chennai Zone': ['Chennai', 'Tambaram'],
    'Coimbatore Zone': ['Coimbatore'],
    'Ahmedabad Zone': ['Ahmedabad', 'Gandhinagar'],
    'Surat Zone': ['Surat'],
    'Jaipur Zone': ['Jaipur'],
    'Udaipur Zone': ['Udaipur'],
    'Lucknow Zone': ['Lucknow', 'Kanpur'],
    'Noida Zone': ['Noida', 'Greater Noida', 'Ghaziabad'],
    'Varanasi Zone': ['Varanasi'],
    'Kolkata Zone': ['Kolkata', 'Howrah'],
    'Hyderabad Zone': ['Hyderabad', 'Secunderabad'],
    'Gurgaon Zone': ['Gurgaon', 'Manesar'],
    'Faridabad Zone': ['Faridabad', 'Palwal'],
  },
  areas: {
    'New Delhi': ['Connaught Place', 'Karol Bagh', 'Chandni Chowk', 'Paharganj', 'Lajpat Nagar'],
    'Mumbai': ['Andheri', 'Bandra', 'Borivali', 'Dadar', 'Colaba'],
    'Bangalore': ['Koramangala', 'Indiranagar', 'Whitefield', 'Jayanagar', 'HSR Layout'],
    'Chennai': ['T Nagar', 'Anna Nagar', 'Adyar', 'Velachery'],
    'Gurgaon': ['DLF Phase 1', 'Sector 14', 'MG Road', 'Sohna Road'],
    'Noida': ['Sector 18', 'Sector 62', 'Sector 15'],
    'Pune': ['Koregaon Park', 'Hinjewadi', 'Kothrud', 'Viman Nagar'],
    'Hyderabad': ['Banjara Hills', 'Jubilee Hills', 'Hitech City', 'Gachibowli'],
    'Kolkata': ['Park Street', 'Salt Lake', 'New Town', 'Howrah'],
    'Jaipur': ['MI Road', 'Malviya Nagar', 'Vaishali Nagar'],
  },
};

export const employees = [
  { id: 'se-001', name: 'Rajesh Kumar', role: 'sales_executive', zone: 'North Zone', city: 'New Delhi', area: 'Connaught Place' },
  { id: 'se-002', name: 'Amit Sharma', role: 'sales_executive', zone: 'North Zone', city: 'New Delhi', area: 'Karol Bagh' },
  { id: 'se-003', name: 'Priya Singh', role: 'sales_executive', zone: 'North Zone', city: 'New Delhi', area: 'Lajpat Nagar' },
  { id: 'se-004', name: 'Vikram Patel', role: 'sales_executive', zone: 'East Zone', city: 'Preet Vihar', area: 'Preet Vihar' },
  { id: 'se-005', name: 'Sunita Gupta', role: 'sales_executive', zone: 'South Zone', city: 'Saket', area: 'Saket' },
  { id: 'asm-001', name: 'Priya Sharma', role: 'asm', zone: 'North Zone', city: '', area: '' },
  { id: 'asm-002', name: 'Rahul Mehta', role: 'asm', zone: 'South Zone', city: '', area: '' },
  { id: 'rsm-001', name: 'Vikram Singh', role: 'rsm', zone: '', city: '', area: '' },
];

export interface GeoFilter {
  country?: string;
  state?: string;
  zone?: string;
  city?: string;
  area?: string;
}

export const filterDataByGeo = <T extends { zone?: string; city?: string; area?: string }>(
  data: T[],
  filter: GeoFilter
): T[] => {
  return data.filter(item => {
    if (filter.zone && item.zone !== filter.zone) return false;
    if (filter.city && item.city !== filter.city) return false;
    if (filter.area && item.area !== filter.area) return false;
    return true;
  });
};
