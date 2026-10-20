import { useRouter } from 'expo-router';
import {
  Appearance,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  Dialog,
  HelperText,
  IconButton,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export default function MenuFormPerbandinganHarga() {
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const styles = createStyles(theme, colorScheme);

  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;

  const [procAppData, setProcAppData] = useState([]);
  const [filteredSupplier, setFilteredSupplier] = useState([]);
  const [filteredBarang, setFilteredBarang] = useState([]);
  const [filteredProcApp, setFilteredProcApp] = useState([]);
  const [idPengadaan, setIdPengadaan] = useState('');
  const [idSupplier, setIdSupplier] = useState('');
  const [idBarang, setIdBarang] = useState('');
  const [idBarangSupplier, setIdBarangSupplier] = useState('');
  const [namaPerbandinganHarga, setNamaPerbandinganHarga] = useState('');
  const [hargaPerbandinganHarga, setHargaPerbandinganHarga] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedField, setSelectedField] = useState('');

  const [visibleInput, setVisibleInput] = useState(false);
  const showDialogInput = () => setVisibleInput(true);
  const hideDialogInput = () => setVisibleInput(false);

  const hasError =
    namaPerbandinganHarga === '' || hargaPerbandinganHarga === '';
  const errorText = hasError ? '*Semua field harus diisi' : '';

  const router = useRouter();

  const [perbandinganHargaOptions, setPerbandinganHargaOptions] = useState([]);
  const [pengadaanOptions, setPengadaanOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [barangOptions, setBarangOptions] = useState([]);
  const [barangData, setBarangData] = useState([]);
  const [barangSupplierData, setBarangSupplierData] = useState([]);
  const [openPengadaan, setOpenPengadaan] = useState(false);
  const [openBarang, setOpenBarang] = useState(false);
  const [openSupplier, setOpenSupplier] = useState(false);
  const [namaSupplier, setNamaSupplier] = useState('');
  const [spesifikasi, setSpesifikasi] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from AsyncStorage
        const jsonValuePengadaan = await AsyncStorage.getItem('PengadaanList');
        const pengadaanList =
          jsonValuePengadaan != null ? JSON.parse(jsonValuePengadaan) : [];

        const jsonBarangProc = await AsyncStorage.getItem('ProcApp');
        const barangList =
          jsonBarangProc != null ? JSON.parse(jsonBarangProc) : [];

        const jsonvalueSupplier = await AsyncStorage.getItem('SupplierList');
        const supplierList =
          jsonvalueSupplier != null ? JSON.parse(jsonvalueSupplier) : [];

        const jsonValueBarang = await AsyncStorage.getItem(
          'BarangSupplierList'
        );
        const barangSupplierList =
          jsonValueBarang != null ? JSON.parse(jsonValueBarang) : [];

        // Filter items based on id_pengadaan
        const filteredSupplier = pengadaanList.filter(
          (item) => item.id_pengadaan === Number(idPengadaan)
        );
        const filteredBarang = supplierList.filter(
          (item) => item.supplier === Number(idSupplier)
        );

        setBarangData(barangList);
        setBarangSupplierData(barangSupplierList);
        setFilteredSupplier(filteredSupplier); // Save filtered supplier data
        setFilteredBarang(filteredBarang);
      } catch (error) {
        console.error('Error fetching procapp data:', error);
      }
    };

    fetchData();
  }, [idPengadaan, idSupplier]);

  const addPerbandinganHargaItem = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('PerbandinganHargaList');
      const storagePerbandinganHarga =
        jsonValue != null ? JSON.parse(jsonValue) : [];
      const newID =
        storagePerbandinganHarga.length > 0
          ? storagePerbandinganHarga[0].id_perbandingan_harga + 1
          : 1;
      const newData = [
        {
          id_perbandingan_harga: newID,
          id_pengadaan: idPengadaan,
          id_supplier: idSupplier,
          id_barang: idBarang,
          id_barang_supplier: idBarangSupplier,
          nama_perbandingan_harga: namaPerbandinganHarga,
          harga_perbandingan_harga: hargaPerbandinganHarga,
          spesifikasi: spesifikasi,
        },
        ...storagePerbandinganHarga,
      ];
      await AsyncStorage.setItem(
        'PerbandinganHargaList',
        JSON.stringify(newData)
      );
      setIdPengadaan('');
      setIdSupplier('');
      setIdBarang('');
      setNamaSupplier('');
      setNamaPerbandinganHarga('');
      setHargaPerbandinganHarga('');
      setSpesifikasi('');
      router.push(`/perbandingan-harga`);
    } catch (e) {
      console.error(e);
    }
  };

  const openMenu = (field) => {
    setSelectedField(field);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const handleSelect = (value) => {
    const selectedItem = filteredProcApp.find((item) => item.nama === value);
    if (selectedItem) {
      setNama(selectedItem.nama); // Set nama
      setKode(selectedItem.kode); // Set kode
      setJenis(selectedItem.jenis); // Set jenis
      setJumlah(selectedItem.jumlah); // Set jumlah
      setIdBarang(selectedItem.id_barang); // Set id_barang based on selected item
    }
    setMenuVisible(false); // Close menu
  };

  const handleOpenDropdown = async () => {
    try {
      const jsonValueBarang = await AsyncStorage.getItem('ProcApp');
      const storageBarang =
        jsonValueBarang != null ? JSON.parse(jsonValueBarang) : [];
      const filteredBarangItems = storageBarang.filter(
        (item) => item.id_pengadaan === Number(id_pengadaan)
      );
      setBarangOptions(filteredBarangItems);
      setOpen(true);
    } catch (error) {
      console.error('Error fetching perbandingan harga options:', error);
    }
  };

  const handlePengadaanOpenDropdown = async () => {
    try {
      const jsonValuePengadaan = await AsyncStorage.getItem('PengadaanList');
      const storagePengadaan =
        jsonValuePengadaan != null ? JSON.parse(jsonValuePengadaan) : null;
      setPengadaanOptions(storagePengadaan);
      setOpenPengadaan(true);
    } catch (e) {
      console.log(e);
    }
  };

  const handleBarangOpenDropdown = async () => {
    try {
      const jsonValueBarang = await AsyncStorage.getItem('ProcApp');
      const storageBarang =
        jsonValueBarang != null ? JSON.parse(jsonValueBarang) : null;
      const filteredBarangItems = storageBarang.filter(
        (item) => item.id_pengadaan === Number(idPengadaan)
      );
      setBarangOptions(filteredBarangItems);
      setOpenBarang(true);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSupplierOpenDropdown = async () => {
    try {
      const barangSupplierValue = await AsyncStorage.getItem(
        'BarangSupplierList'
      );
      const supplierListValue = await AsyncStorage.getItem('SupplierList');
      const barangSupplierList =
        barangSupplierValue != null ? JSON.parse(barangSupplierValue) : [];
      const supplierList =
        supplierListValue != null ? JSON.parse(supplierListValue) : [];

      // Filter by id_barang
      const filtered = barangSupplierList.filter(
        (item) => item.id_barang === Number(idBarang)
      );

      const filteredNama = barangSupplierList.filter(
        (item) => item.nama === getNamaBarang(idBarang)
      );

      // Map to dropdown options with harga and nama_supplier
      const options = filteredNama.map((item) => {
        const supplier = supplierList.find(
          (s) => s.id_supplier === item.id_supplier
        );
        return {
          ...item,
          nama_supplier: supplier ? supplier.nama_supplier : 'Unknown Supplier',
          display: `${supplier ? supplier.nama_supplier : 'Unknown'} - Rp${
            item.harga
          }`,
        };
      });
      setSupplierOptions(options);
      setOpenSupplier(true);
    } catch (e) {
      console.log(e);
    }
  };

  // const handleSupplierOpenDropdown = async () => {
  //   try {
  //     const jsonValueSupplier = await AsyncStorage.getItem(
  //       "BarangSupplierList"
  //     );
  //     const storageSupplier =
  //       jsonValueSupplier != null ? JSON.parse(jsonValueSupplier) : null;
  //     const filteredSupplierItems = storageSupplier.filter(
  //       (item) => item.id_barang === Number(idBarang)
  //     );
  //     setSupplierOptions(filteredSupplierItems);
  //     setOpenSupplier(true);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  const getNamaSupplier = (option) => {
    setNamaSupplier(option.nama_supplier);
  };

  const getNamaBarangSupplier = (id_barang_supplier) => {
    const parsedIdBarangSupplier = Number(id_barang_supplier); // ensure it's a number
    const found = barangSupplierData.find(
      (p) => Number(p.id_barang_supplier) === parsedIdBarangSupplier
    );
    return found ? found.nama : '-';
  };

  const getNamaBarang = (id) => {
    const parsedIdBarang = Number(id); // ensure it's a number
    const found = barangData.find((p) => Number(p.id) === parsedIdBarang);
    return found ? found.nama : '-';
  };

  const backButton = () => {
    setIdPengadaan('');
    setIdSupplier('');
    setIdBarang('');
    setNamaSupplier('');
    setNamaPerbandinganHarga('');
    setHargaPerbandinganHarga('');
    setSpesifikasi('');
    router.push(`/perbandingan-harga`);
  };

  return (
    <Container style={styles.container}>
      <ScrollView>
        <View style={styles.title}>
          <IconButton
            icon="keyboard-backspace"
            iconColor={colorScheme === 'dark' ? 'white' : 'black'}
            size={50}
            onPress={backButton}
          />
          <Text variant="displaySmall" style={styles.titleNameText}>
            Form {'\n'}Perbandingan Harga
          </Text>
        </View>
        <View style={styles.inputContainerText}>
          <Text variant="headlineSmall">Nama Transaksi</Text>
          <TextInput
            placeholder="Masukkan Nama Transaksi"
            maxLength={30}
            label={'Transaksi'}
            value={namaPerbandinganHarga}
            onChangeText={setNamaPerbandinganHarga}
          />
          <Text variant="headlineSmall">Pengadaan</Text>
          <TextInput
            label="Pengadaan"
            value={
              pengadaanOptions.find(
                (item) => item.id_pengadaan === Number(idPengadaan)
              )?.nama_pengadaan || ''
            }
            placeholder="Pilih Pengadaan"
            right={
              <TextInput.Icon
                icon="menu-down"
                onPress={handlePengadaanOpenDropdown} // Use the updated function
              />
            }
            editable={false}
          />
          <Modal
            visible={openPengadaan}
            transparent
            animationType="fade"
            onRequestClose={() => setOpenPengadaan(false)}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.3)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              activeOpacity={1}
              onPress={() => setOpenPengadaan(false)} // Only close when tapping outside the modal content
            >
              <View
                style={{
                  backgroundColor: colorScheme === 'dark' ? '#222' : '#fff', // Strong contrast
                  borderRadius: 8,
                  width: '80%',
                  padding: 10,
                  elevation: 10,
                  borderWidth: 1,
                  borderColor: colorScheme === 'dark' ? '#888' : '#ccc', // subtle border
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.4,
                  shadowRadius: 4,
                }}
                onStartShouldSetResponder={() => true} // Prevents closing when pressing inside
              >
                {pengadaanOptions.map((option) => (
                  <Button
                    key={option.id_pengadaan}
                    onPress={() => {
                      setIdPengadaan(option.id_pengadaan.toString());
                      setOpenPengadaan(false);
                    }}
                    style={{
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                    }}
                    contentStyle={{ justifyContent: 'flex-start' }}
                    labelStyle={{ color: theme.text, textAlign: 'left' }}
                  >
                    {option.nama_pengadaan}
                  </Button>
                ))}
                <Button onPress={() => setOpenPengadaan(false)}>Tutup</Button>
              </View>
            </TouchableOpacity>
          </Modal>
          <Text variant="headlineSmall">Barang</Text>
          <TextInput
            label="Barang"
            value={
              idBarang
                ? barangOptions.find((item) => item.id === Number(idBarang))
                    ?.nama || ''
                : ''
            }
            placeholder="Pilih Barang"
            right={
              <TextInput.Icon
                icon="menu-down"
                disabled={!idPengadaan}
                onPress={handleBarangOpenDropdown} // Use the updated function
              />
            }
            disabled={!idPengadaan}
            editable={false}
          />
          <Modal
            visible={openBarang}
            transparent
            animationType="fade"
            onRequestClose={() => setOpenBarang(false)}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.3)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              activeOpacity={1}
              onPress={() => setOpenBarang(false)} // Only close when tapping outside the modal content
            >
              <ScrollView>
                <View
                  style={{
                    backgroundColor: colorScheme === 'dark' ? '#222' : '#fff', // Strong contrast
                    borderRadius: 8,
                    width: '80%',
                    padding: 10,
                    elevation: 10,
                    borderWidth: 1,
                    borderColor: colorScheme === 'dark' ? '#888' : '#ccc', // subtle border
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.4,
                    shadowRadius: 4,
                  }}
                  onStartShouldSetResponder={() => true} // Prevents closing when pressing inside
                >
                  {barangOptions.map((option) => (
                    <Button
                      key={option.id}
                      onPress={() => {
                        setIdBarang(option.id.toString());
                        const matchedBarangSupplier = barangSupplierData.find(
                          (barang) => barang.nama === option.nama
                        );
                        if (matchedBarangSupplier) {
                          setIdBarangSupplier(
                            matchedBarangSupplier.id_barang_supplier?.toString() ||
                              ''
                          );
                        }
                        setOpenBarang(false);
                      }}
                      style={{
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                      }}
                      contentStyle={{ justifyContent: 'flex-start' }}
                      labelStyle={{ color: theme.text, textAlign: 'left' }}
                    >
                      {option.nama}
                    </Button>
                  ))}
                  <Button onPress={() => setOpenBarang(false)}>Tutup</Button>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </Modal>
          <Text variant="headlineSmall">Supplier</Text>
          <TextInput
            label="Supplier"
            value={namaSupplier}
            // value={
            //   idBarang
            //     ? supplierOptions.find(
            //         (item) => item.id_barang === Number(idBarang)
            //       )?.nama_supplier || ""
            //     : ""
            // }
            placeholder="Pilih Supplier"
            right={
              <TextInput.Icon
                icon="menu-down"
                disabled={!idBarang}
                onPress={handleSupplierOpenDropdown} // Use the updated function
              />
            }
            disabled={!idBarang}
            editable={false}
          />
          <Modal
            visible={openSupplier}
            transparent
            animationType="fade"
            onRequestClose={() => setOpenSupplier(false)}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.3)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              activeOpacity={1}
              onPress={() => setOpenSupplier(false)} // Only close when tapping outside the modal content
            >
              <View
                style={{
                  backgroundColor: colorScheme === 'dark' ? '#222' : '#fff', // Strong contrast
                  borderRadius: 8,
                  width: '80%',
                  padding: 10,
                  elevation: 10,
                  borderWidth: 1,
                  borderColor: colorScheme === 'dark' ? '#888' : '#ccc', // subtle border
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.4,
                  shadowRadius: 4,
                }}
                onStartShouldSetResponder={() => true} // Prevents closing when pressing inside
              >
                {supplierOptions.map((option) => (
                  <Button
                    key={`${option.id_supplier}-${option.id_barang_supplier}`}
                    onPress={() => {
                      setIdSupplier(option.id_supplier.toString());
                      setHargaPerbandinganHarga(option.harga.toString());
                      setNamaSupplier(option.nama_supplier);
                      setSpesifikasi(option.spesifikasi || '');
                      setOpenSupplier(false);
                    }}
                    style={{
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                    }}
                    contentStyle={{ justifyContent: 'flex-start' }}
                    labelStyle={{ color: theme.text, textAlign: 'left' }}
                  >
                    {option.display}
                  </Button>
                ))}
                <Button onPress={() => setOpenSupplier(false)}>Tutup</Button>
              </View>
            </TouchableOpacity>
          </Modal>
          <Text variant="headlineSmall">Harga</Text>
          <TextInput
            placeholder="Harga Barang"
            maxLength={30}
            label="Harga"
            value={hargaPerbandinganHarga}
            disabled
          />
          <Text variant="headlineSmall">Spesifikasi</Text>
          <TextInput
            multiline
            numberOfLines={4}
            placeholder="Masukkan Spesifikasi"
            maxLength={200}
            label={'Spesifikasi'}
            value={spesifikasi}
            onChangeText={setSpesifikasi}
            style={{ minHeight: 120 }}
            disabled
          />
          <HelperText type="info" visible={hasError}>
            {errorText}
          </HelperText>
        </View>
        <View style={styles.buttonGroup}>
          <Button
            mode="contained"
            labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
            buttonColor="#3DA6CC"
            textColor="black"
            onPress={() => {
              if (hasError) {
                showDialogInput(); // Show dialog if any field is empty
              } else {
                addPerbandinganHargaItem(); // Save if all fields are filled
              }
            }}
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
    },
    title: {
      flexDirection: 'row',
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
      marginBottom: 10,
      padding: 10,
      gap: 6,
      width: '100%',
      marginHorizontal: 'auto',
      pointerEvents: 'auto',
    },
    buttonGroup: {
      marginHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });
}
