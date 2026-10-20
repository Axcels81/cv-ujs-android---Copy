import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Appearance,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/Colors';
import { StatusBar } from 'expo-status-bar';
import {
  Button,
  Dialog,
  IconButton,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';

export default function EditPerbandinganHarga() {
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(theme, colorScheme);
  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;

  const { id } = useLocalSearchParams();
  const [perbandinganHarga, setPerbandinganHarga] = useState({});
  const [pengadaanData, setPengadaanData] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [barangSupplierData, setBarangSupplierData] = useState([]);
  const router = useRouter();

  const [visibleInput, setVisibleInput] = useState(false);
  const showDialogInput = () => setVisibleInput(true);
  const hideDialogInput = () => setVisibleInput(false);

  useEffect(() => {
    const fetchData = async (id) => {
      try {
        const jsonValue = await AsyncStorage.getItem('PerbandinganHargaList');
        const storagePerbandinganHarga =
          jsonValue != null ? JSON.parse(jsonValue) : null;

        if (storagePerbandinganHarga && storagePerbandinganHarga.length) {
          const myPerbandinganHarga = storagePerbandinganHarga.find(
            (item) => item.id_perbandingan_harga.toString() === id
          );
          setPerbandinganHarga(myPerbandinganHarga || {});
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData(id);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      const fetchAllData = async () => {
        try {
          const jsonValuePengadaan = await AsyncStorage.getItem(
            'PengadaanList'
          );
          const dataPengadaan =
            jsonValuePengadaan != null ? JSON.parse(jsonValuePengadaan) : [];
          const jsonValueSupplier = await AsyncStorage.getItem('SupplierList');
          const dataSupplier =
            jsonValueSupplier != null ? JSON.parse(jsonValueSupplier) : [];
          const jsonValueBarangSupplier = await AsyncStorage.getItem(
            'BarangSupplierList'
          );
          const dataBarangSupplier =
            jsonValueBarangSupplier != null
              ? JSON.parse(jsonValueBarangSupplier)
              : [];
          setPengadaanData(dataPengadaan);
          setSupplierData(dataSupplier);
          setBarangSupplierData(dataBarangSupplier);
        } catch (error) {
          console.error(error);
        }
      };
      fetchAllData();
    }, [])
  );

  const getNamaPengadaan = (id_pengadaan) => {
    const parsedIdPengadaan = Number(id_pengadaan); // ensure it's a number
    const found = pengadaanData.find(
      (p) => Number(p.id_pengadaan) === parsedIdPengadaan
    );
    return found ? found.nama_pengadaan : '-';
  };

  const getNamaBarang = (id_barang_supplier) => {
    const parsedIdBarangSupplier = Number(id_barang_supplier); // ensure it's a number
    const found = barangSupplierData.find(
      (p) => Number(p.id_barang_supplier) === parsedIdBarangSupplier
    );
    return found ? found.nama : '-';
  };

  const getNamaSupplier = (id_supplier) => {
    const parsedIdSupplier = Number(id_supplier); // ensure it's a number
    const found = supplierData.find(
      (p) => Number(p.id_supplier) === parsedIdSupplier
    );
    return found ? found.nama_supplier : '-';
  };

  const getHargaBarangSupplier = (id_barang_supplier) => {
    const parsedIdBarangSupplier = Number(id_barang_supplier); // ensure it's a number
    const found = barangSupplierData.find(
      (p) => Number(p.id_barang_supplier) === parsedIdBarangSupplier
    );
    return found ? found.harga : '-';
  };

  const handleSave = async () => {
    if (!perbandinganHarga.nama_perbandingan_harga) {
      showDialogInput();
      return;
    }
    try {
      const savedPerbandinganHarga = {
        ...perbandinganHarga,
        id_perbandingan_harga: perbandinganHarga.id_perbandingan_harga,
        id_pengadaan: perbandinganHarga.id_pengadaan,
        id_supplier: perbandinganHarga.id_supplier,
        id_barang: perbandinganHarga.id_barang,
        id_barang_supplier: perbandinganHarga.id_barang_supplier,
        nama_perbandingan_harga: perbandinganHarga.nama_perbandingan_harga,
        harga_perbandingan_harga: perbandinganHarga.harga_perbandingan_harga,
        spesifikasi: perbandinganHarga.spesifikasi || '',
      };
      const jsonValue = await AsyncStorage.getItem('PerbandinganHargaList');
      const storagePerbandinganHarga =
        jsonValue != null ? JSON.parse(jsonValue) : null;

      if (storagePerbandinganHarga && storagePerbandinganHarga.length) {
        const otherPerbandinganHarga = storagePerbandinganHarga.filter(
          (item) =>
            item.id_perbandingan_harga !==
            savedPerbandinganHarga.id_perbandingan_harga
        );
        const updatePerbandinganHarga = [
          ...otherPerbandinganHarga,
          savedPerbandinganHarga,
        ].sort((a, b) => b.id_perbandingan_harga - a.id_perbandingan_harga);
        await AsyncStorage.setItem(
          'PerbandinganHargaList',
          JSON.stringify(updatePerbandinganHarga)
        );
      } else {
        await AsyncStorage.setItem(
          'PerbandinganHargaList',
          JSON.stringify([savedPerbandinganHarga])
        );
      }
      router.push('/perbandingan-harga');
    } catch (e) {
      console.error(e);
    }
  };
  const handlePress = () => {
    router.push('/perbandingan-harga');
  };

  return (
    <Container style={styles.container}>
      <ScrollView>
        <View style={styles.title}>
          <IconButton
            icon="keyboard-backspace"
            iconColor={colorScheme === 'dark' ? 'white' : 'black'}
            size={50}
            onPress={handlePress}
          />
          <Text variant="displaySmall" style={styles.titleNameText}>
            Edit{'\n'} Perbandingan Harga
          </Text>
        </View>
        <View style={styles.inputContainerText}>
          <Text variant="headlineSmall">Nama Transaksi</Text>
          <TextInput
            placeholder="Edit Nama Transaksi"
            maxLength={30}
            label={'Nama Transaksi'}
            value={perbandinganHarga?.nama_perbandingan_harga || ''}
            onChangeText={(nama_perbandingan_harga) =>
              setPerbandinganHarga((prev) => ({
                ...prev,
                nama_perbandingan_harga,
              }))
            }
          />
          <Text variant="headlineSmall">Pengadaan</Text>
          <TextInput
            placeholder="Pengadaan"
            maxLength={30}
            label={'Pengadaan'}
            value={getNamaPengadaan(perbandinganHarga?.id_pengadaan) || ''}
            disabled
          />
          <Text variant="headlineSmall">Barang</Text>
          <TextInput
            placeholder="Barang"
            maxLength={30}
            label={'Barang'}
            value={getNamaBarang(perbandinganHarga?.id_barang_supplier) || ''}
            disabled
          />
          <Text variant="headlineSmall">Supplier</Text>
          <TextInput
            placeholder="Supplier"
            maxLength={30}
            label={'Supplier'}
            value={getNamaSupplier(perbandinganHarga?.id_supplier) || ''}
            disabled
          />
          <Text variant="headlineSmall">Harga</Text>
          <TextInput
            placeholder="Harga Barang"
            maxLength={30}
            label={'Harga Barang'}
            value={
              String(
                getHargaBarangSupplier(
                  perbandinganHarga?.id_barang ||
                    perbandinganHarga?.id_barang_supplier
                )
              ) || ''
            }
            // value={perbandinganHarga?.harga_perbandingan_harga || '-'}
            disabled
          />
          <Text variant="headlineSmall">Spesifikasi</Text>
          <TextInput
            placeholder="Edit Spesifikasi"
            maxLength={200}
            label={'Spesifikasi'}
            value={perbandinganHarga?.spesifikasi || ''}
            onChangeText={(spesifikasi) =>
              setPerbandinganHarga((prev) => ({ ...prev, spesifikasi }))
            }
            multiline
            numberOfLines={4}
            style={{ minHeight: 120 }}
            disabled
          />
        </View>
        <View style={styles.buttonGroup}>
          <Button
            mode="contained"
            labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
            buttonColor="#3DA6CC"
            textColor="black"
            onPress={handlePress}
          >
            Kembali
          </Button>
          <Button
            mode="contained"
            labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
            buttonColor="#A7E585"
            textColor="black"
            onPress={handleSave}
          >
            Simpan
          </Button>
        </View>
        <Portal>
          <Dialog visible={visibleInput} onDismiss={hideDialogInput}>
            <Dialog.Icon icon="alert" />
            <Dialog.Title style={styles.titleDialog}>
              Terjadi Kesalahan
            </Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">Semua field harus diisi!</Text>
            </Dialog.Content>
          </Dialog>
        </Portal>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ScrollView>
    </Container>
  );
}

function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      backgroundColor: theme.background,
      padding: 20,
    },
    title: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    titleNameText: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      justifyContent: 'center',
      flex: 1,
      color: theme.text,
      marginLeft: 10,
      marginRight: 100,
    },
    inputContainerText: {
      marginBottom: 20,
    },
    buttonGroup: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });
}
