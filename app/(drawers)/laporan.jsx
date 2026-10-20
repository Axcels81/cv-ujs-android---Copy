import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Appearance, Dimensions, StyleSheet, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Banner, Button, Divider, Text } from 'react-native-paper';
import { id, registerTranslation } from 'react-native-paper-dates';

registerTranslation('id', id);

export default function MenuLaporan() {
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(theme, colorScheme);
  const [barangPengadaanData, setBarangPengadaanData] = useState([]);
  const [pengadaanData, setPengadaanData] = useState([]);
  const [visible, setVisible] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchBarangData = async () => {
        const jsonValueBarangPengadaan = await AsyncStorage.getItem('ProcApp');
        const dataBarangPengadaan =
          jsonValueBarangPengadaan != null
            ? JSON.parse(jsonValueBarangPengadaan)
            : [];

        const jsonValuePengadaan = await AsyncStorage.getItem('PengadaanList');
        const dataPengadaan =
          jsonValuePengadaan != null ? JSON.parse(jsonValuePengadaan) : null;

        setPengadaanData(dataPengadaan);
        setBarangPengadaanData(dataBarangPengadaan);
      };
      fetchBarangData();
    }, [])
  );

  const jenisCount = {};
  barangPengadaanData.forEach((item) => {
    if (jenisCount[item.jenis]) {
      jenisCount[item.jenis]++;
    } else {
      jenisCount[item.jenis] = 1;
    }
  });

  const total = Object.values(jenisCount).reduce(
    (sum, count) => sum + count,
    0
  );

  const getRandomColor = () =>
    `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')}`;

  const dataJenis = Object.entries(jenisCount).map(([jenis, count]) => ({
    name: `% ${jenis}`,
    population: total > 0 ? Math.round((count / total) * 100) : 0, // percentage
    color: getRandomColor(),
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  }));

  const tahunCount = {};
  if (Array.isArray(pengadaanData)) {
    pengadaanData.forEach((item) => {
      const tahun = item.tanggal_pengadaan
        ? item.tanggal_pengadaan.substring(0, 4)
        : 'Unknown';
      if (tahunCount[tahun]) {
        tahunCount[tahun]++;
      } else {
        tahunCount[tahun] = 1;
      }
    });
  }

  const totalTahun = Object.values(tahunCount).reduce(
    (sum, counts) => sum + counts,
    0
  );

  const dataTahun = Object.entries(tahunCount).map(([tahun, counts]) => ({
    name: `% Tahun ${tahun}`,
    population: totalTahun > 0 ? Math.round((counts / totalTahun) * 100) : 0,
    color: getRandomColor(),
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  }));

  const chartConfig = {
    backgroundGradientFrom: '#1E2923',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#08130D',
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <Banner visible={visible}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#f0f0f0',
              borderRadius: 8,
              marginRight: 8,
              padding: 12,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 16,
                marginBottom: 4,
                color: '#333',
              }}
            >
              Total Pengadaan
            </Text>
            <Text
              style={{ fontSize: 20, fontWeight: 'bold', color: '#007AFF' }}
            >
              {Array.isArray(pengadaanData) ? pengadaanData.length : 0}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: '#f0f0f0',
              borderRadius: 8,
              marginLeft: 8,
              padding: 12,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 16,
                marginBottom: 4,
                color: '#333',
              }}
            >
              Total Item
            </Text>
            <Text
              style={{ fontSize: 20, fontWeight: 'bold', color: '#007AFF' }}
            >
              {Array.isArray(barangPengadaanData)
                ? barangPengadaanData.length
                : 0}
            </Text>
          </View>
        </View>
      </Banner>
      {/* <Text style={styles.title}>
        Selamat Datang Di {'\n'} Aplikasi Pengadaan Barang {'\n'}CV. UJS
      </Text> */}

      <View style={styles.jenisContainer}>
        <Text style={styles.title} variant="bodyLarge">
          Data Barang Per Jenis
        </Text>
        <PieChart
          data={dataJenis}
          width={screenWidth}
          height={200}
          chartConfig={chartConfig}
          accessor={'population'}
          backgroundColor={'transparent'}
          paddingLeft={'-30'}
          center={[10, 10]}
          absolute
        />
      </View>
      <Divider />
      <View style={styles.jenisContainer}>
        <Text style={styles.title} variant="bodyLarge">
          Data Pengadaan Per Tahun
        </Text>

        <PieChart
          data={dataTahun}
          width={screenWidth}
          height={200}
          chartConfig={chartConfig}
          accessor={'population'}
          backgroundColor={'transparent'}
          paddingLeft={'-30'}
          center={[10, 10]}
          absolute
        />
      </View>
      {visible ? (
        <View style={styles.bottomButtonContainer}>
          <Button
            icon="eye-off"
            mode="contained"
            buttonColor="white"
            textColor="black"
            onPress={() => setVisible(false)}
            style={{ borderRadius: 24 }}
          >
            Hilangkan Jumlah Data
          </Button>
        </View>
      ) : (
        <View style={styles.bottomButtonContainer}>
          <Button
            icon="eye"
            mode="contained"
            buttonColor="white"
            textColor="black"
            onPress={() => setVisible(true)}
            style={{ borderRadius: 24 }}
          >
            Tampilkan Jumlah Data
          </Button>
        </View>
      )}

      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </View>
  );
}

function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      akignItems: 'center',
      backgroundColor: theme.background,
    },
    bottomButtonContainer: {
      position: 'absolute',
      bottom: 32,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
    },
    jenisContainer: {
      flex: 1,
      justifyContent: 'space-evenly',
    },
    image: {
      width: '100%',
      height: '100%',
      flex: 1,
      resizeMode: 'center',
      justifyContent: 'center',
    },
    watermarkContainer: {
      position: 'absolute',
      top: '30%', // adjust as needed
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 0,
    },
    watermark: {
      width: 320, // adjust size as needed
      height: 320,
    },
    title: {
      color: theme.text,
      fontSize: 20,
      textAlign: 'center',
      fontWeight: 'bold',
    },
  });
}
