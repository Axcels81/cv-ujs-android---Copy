import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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

export default function EditBarangSupplier() {
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(theme, colorScheme);
  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;

  const { id, supplier, id_pengadaan } = useLocalSearchParams();
  const selectedSupplierId = supplier ? Number(supplier) : null;
  const selectedPengadaanId = id_pengadaan ? Number(id_pengadaan) : null;
  const [barangSupplier, setBarangSupplier] = useState({});
  const router = useRouter();

  const [visibleInput, setVisibleInput] = useState(false);
  const showDialogInput = () => setVisibleInput(true);
  const hideDialogInput = () => setVisibleInput(false);

  useEffect(() => {
    const fetchData = async (id) => {
      try {
        const jsonValue = await AsyncStorage.getItem('BarangSupplierList');
        const storageBarangSupplierList =
          jsonValue != null ? JSON.parse(jsonValue) : null;
        if (storageBarangSupplierList && storageBarangSupplierList.length) {
          const myBarangSupplier = storageBarangSupplierList.find(
            (item) => item.id_barang_supplier.toString() === id
          );
          setBarangSupplier(myBarangSupplier || {});
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData(id);
  }, [id]);

  const handleSave = async () => {
    if (
      !barangSupplier.nama ||
      !barangSupplier.kode ||
      !barangSupplier.jenis ||
      !barangSupplier.jumlah ||
      !barangSupplier.harga
    ) {
      showDialogInput();
      return;
    }
    try {
      const savedBarangSupplier = {
        ...barangSupplier,
        nama: barangSupplier.nama,
        kode: barangSupplier.kode,
        jenis: barangSupplier.jenis,
        jumlah: barangSupplier.jumlah,
        harga: barangSupplier.harga,
        spesifikasi: barangSupplier.spesifikasi,
      };
      const jsonValue = await AsyncStorage.getItem('BarangSupplierList');
      const storageBarangSupplierList =
        jsonValue != null ? JSON.parse(jsonValue) : null;

      if (storageBarangSupplierList && storageBarangSupplierList.length) {
        const otherBarangSupplier = storageBarangSupplierList.filter(
          (item) =>
            item.id_barang_supplier !== savedBarangSupplier.id_barang_supplier
        );
        const updateBarangSupplier = [
          ...otherBarangSupplier,
          savedBarangSupplier,
        ].sort((a, b) => b.id_barang_supplier - a.id_barang_supplier);
        await AsyncStorage.setItem(
          'BarangSupplierList',
          JSON.stringify(updateBarangSupplier)
        );
      } else {
        await AsyncStorage.setItem(
          'BarangSupplierList',
          JSON.stringify([savedBarangSupplier])
        );
      }
      // router.push('/barang-supplier');
      router.push({
        pathname: `/barang-supplier`,
        params: {
          supplier: selectedSupplierId,
          id_pengadaan: selectedPengadaanId,
        },
      });
    } catch (e) {
      console.error(e);
    }
  };
  const handlePress = () => {
    // router.push(`/barang-supplier`);
    router.push({
      pathname: `/barang-supplier`,
      params: {
        supplier: selectedSupplierId,
        id_pengadaan: selectedPengadaanId,
      },
    });
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
            Edit{'\n'} Barang Supplier
          </Text>
        </View>
        <View style={styles.inputContainerText}>
          <Text variant="headlineSmall">Nama Barang Supplier</Text>
          <TextInput
            placeholder="Edit Nama Barang Supplier"
            maxLength={30}
            label={'Nama Barang Supplier'}
            value={barangSupplier?.nama || ''}
            disabled
          />
          <Text variant="headlineSmall">Kode Barang Supplier</Text>
          <TextInput
            placeholder="Edit Kode Barang Supplier"
            maxLength={30}
            label={'Kode barang Supplier'}
            value={barangSupplier?.kode || ''}
            disabled
          />
          <Text variant="headlineSmall">Jenis Barang Supplier</Text>
          <TextInput
            placeholder="Edit Jenis barang Supplier"
            maxLength={30}
            label={'Jenis barang Supplier'}
            value={barangSupplier?.jenis || ''}
            disabled
          />
          <Text variant="headlineSmall">Jumlah Barang Supplier</Text>
          <TextInput
            placeholder="Edit Jumlah barang Supplier"
            maxLength={30}
            label={'Jumlah barang Supplier'}
            value={String(barangSupplier?.jumlah || '')}
            disabled
          />
          <Text variant="headlineSmall">Harga Barang Supplier</Text>
          <TextInput
            placeholder="Edit Harga barang Supplier"
            maxLength={30}
            label={'Harga barang Supplier'}
            value={String(barangSupplier?.harga || '')}
            onChangeText={(harga) =>
              setBarangSupplier((prev) => ({ ...prev, harga }))
            }
          />
          <Text variant="headlineSmall">Spesifikasi</Text>
          <TextInput
            placeholder="Edit Spesifikasi"
            maxLength={200}
            label={'Spesifikasi'}
            value={barangSupplier?.spesifikasi || ''}
            onChangeText={(spesifikasi) =>
              setBarangSupplier((prev) => ({ ...prev, spesifikasi }))
            }
            multiline
            numberOfLines={4}
            style={{ minHeight: 120 }}
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
    titleDialog: {
      textAlign: 'center',
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
