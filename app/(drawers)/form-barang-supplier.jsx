import { useLocalSearchParams, useRouter } from 'expo-router';
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
  Menu,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export default function MenuFormBarangSupplier(id_barang) {
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const styles = createStyles(theme, colorScheme);

  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;

  const [proc, setProc] = useState([]);
  const [filteredProc, setFilteredProc] = useState([]);
  const [procAppData, setProcAppData] = useState([]);
  const [filteredProcApp, setFilteredProcApp] = useState([]);
  const [idBarang, setIdBarang] = useState('');
  const [nama, setNama] = useState('');
  const [kode, setKode] = useState('');
  const [jenis, setJenis] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [harga, setHarga] = useState('');
  const [spesifikasi, setSpesifikasi] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedField, setSelectedField] = useState('');

  const { supplier, id_pengadaan } = useLocalSearchParams();
  const selectedSupplierId = supplier ? Number(supplier) : null;
  const selectedPengadaanId = id_pengadaan ? Number(id_pengadaan) : null;

  const [visibleInput, setVisibleInput] = useState(false);
  const showDialogInput = () => setVisibleInput(true);
  const hideDialogInput = () => setVisibleInput(false);

  const hasError =
    nama === '' || kode === '' || jenis === '' || jumlah === '' || harga === '';
  const errorText = hasError ? '*Semua field harus diisi' : '';

  const router = useRouter();

  const [barangOptions, setBarangOptions] = useState([]);
  const [open, setOpen] = useState(false);

  const [combinedData, setCombinedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from AsyncStorage
        const jsonValue = await AsyncStorage.getItem('ProcApp');
        const procAppList = jsonValue != null ? JSON.parse(jsonValue) : [];

        // Filter items based on id_pengadaan
        const filteredItems = procAppList.filter(
          (item) => item.id_pengadaan === Number(id_pengadaan)
        );

        setProcAppData(procAppList); // Save full data for reference
        setFilteredProcApp(filteredItems); // Save filtered items for dropdown
      } catch (error) {
        console.error('Error fetching procapp data:', error);
      }
    };

    fetchData();
  }, [id_pengadaan]);

  // useEffect(() => {
  //     const fetchData = async () => {
  //         try {
  //             const jsonValue = await AsyncStorage.getItem("ProcApp");
  //             const storageProc = jsonValue != null ? JSON.parse(jsonValue) : BARANG_ITEM;
  //             console.log("Fetched procapp data:", storageProc); // Debug log
  //             const filteredItems = storageProc.filter(item => {
  //                 const supplierItem = SUPPLIER_ITEM.find(
  //                     supplier => supplier.id_barang === item.id && supplier.id_supplier === Number(supplier)
  //                 );
  //                 return supplierItem && item.id_pengadaan === Number(id_pengadaan);
  //             });
  //             setNamaBarangOptions(storageProc)
  //             setProc(storageProc);
  //             setFilteredProc(filteredItems);
  //         } catch (e) {
  //             console.error(e);
  //         }
  //     };
  //     fetchData();
  // }, [supplier, id_pengadaan]);

  // useEffect(() => {
  //     const fetchData = async () => {
  //         try {
  //             // Fetch data from AsyncStorage
  //             const barangSupplierData = await AsyncStorage.getItem("BarangSupplierList");
  //             const procAppData = await AsyncStorage.getItem("ProcApp");
  //             const supplierListData = await AsyncStorage.getItem("SupplierList");

  //             const barangSupplierList = barangSupplierData != null ? JSON.parse(barangSupplierData) : [];
  //             const procAppList = procAppData != null ? JSON.parse(procAppData) : [];
  //             const supplierList = supplierListData != null ? JSON.parse(supplierListData) : [];

  //             // Combine data based on relationships
  //             const combined = barangSupplierList.map(barangSupplier => {
  //                 const procItem = procAppList.find(proc => proc.id === barangSupplier.id_barang);
  //                 const supplierItem = supplierList.find(supplier => supplier.id_supplier === barangSupplier.id_supplier);

  //                 return {
  //                     ...barangSupplier,
  //                     barangDetails: procItem || {}, // Add details from ProcApp
  //                     supplierDetails: supplierItem || {}, // Add details from SupplierList
  //                 };
  //             });
  //             const filtered = combined.filter(item => item.id_barang === id);
  //             setFilteredData(filtered);
  //         } catch (error) {
  //             console.error("Error fetching or combining data:", error);
  //         }
  //     };

  //     fetchData();
  // }, [id_barang]);

  const addSupplierItem = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('BarangSupplierList');
      const storageSupplier = jsonValue != null ? JSON.parse(jsonValue) : [];
      const newID =
        storageSupplier.length > 0
          ? storageSupplier[0].id_barang_supplier + 1
          : 1;
      const newData = [
        {
          id_barang_supplier: newID,
          id_barang: idBarang,
          nama,
          kode,
          jenis,
          jumlah,
          harga,
          spesifikasi,
          id_supplier: selectedSupplierId,
        },
        ...storageSupplier,
      ];
      await AsyncStorage.setItem('BarangSupplierList', JSON.stringify(newData));
      setNama('');
      setKode('');
      setJenis('');
      setJumlah('');
      setHarga('');
      setSpesifikasi('');
      router.push({
        pathname: '/barang-supplier',
        params: {
          supplier: selectedSupplierId,
          id_pengadaan: selectedPengadaanId,
        },
      });
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
      console.error('Error fetching barang options:', error);
    }
  };

  const backButton = () => {
    setNama('');
    setKode('');
    setJenis('');
    setJumlah('');
    setHarga('');
    setSpesifikasi('');
    setIdBarang('');
    setSelectedField('');
    router.push({
      pathname: '/barang-supplier',
      params: {
        supplier: selectedSupplierId,
        id_pengadaan: selectedPengadaanId,
      },
    });
  };

  // const handleSelect = (value) => {
  //     const selectedItem = filteredData.find(item => item.nama === value);
  //     if (selectedField === 'nama') {
  //             // Find the selected item based on the name
  //             if (selectedItem) {
  //                 setIdBarang(selectedItem.id);
  //                 setNama(selectedItem.nama);
  //                 setKode(selectedItem.kode);
  //                 setJenis(selectedItem.jenis);
  //                 setJumlah(selectedItem.jumlah);
  //             }
  //         } else if (selectedField === 'kode') {
  //             setKode(value);
  //         } else if (selectedField === 'jenis') {
  //             setJenis(value);
  //         } else if (selectedField === 'jumlah') {
  //             setJumlah(value);
  //         }
  //         closeMenu();
  // };

  return (
    <Container style={styles.container}>
      <ScrollView>
        <View style={styles.title}>
          <IconButton
            icon="keyboard-backspace"
            iconColor={colorScheme === 'dark' ? 'white' : 'black'}
            size={50}
            onPress={backButton}
            // onPress={() => router.push({ pathname: '/barang-supplier', params: { supplier: selectedSupplierId } })}
          />
          <Text variant="displaySmall" style={styles.titleNameText}>
            Form {'\n'} Barang Supplier
          </Text>
        </View>
        <View style={styles.inputContainerText}>
          {/* <Text variant="headlineSmall">Nama Barang Tes</Text>
            <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                    <TextInput
                        placeholder="Pilih Nama"
                        value={nama}
                        onFocus={() => setMenuVisible(true)} // Open menu on focus
                    />
                }
            >
                {filteredProcApp.map((item, index) => (
                    <Menu.Item
                        key={`${item.nama}-${index}`}
                        onPress={() => handleSelect(item.nama)}
                        title={item.nama}
                    />
                ))}
            </Menu>
                <Text variant="headlineSmall">Nama Barang</Text>
                <Menu
                    visible={menuVisible && selectedField === 'nama'}
                    onDismiss={closeMenu}
                    anchor={
                        <TextInput
                            placeholder="Pilih Nama"
                            value={nama}
                            onFocus={() => openMenu('nama')}
                        />
                    }
                >
                    
                    {filteredProcApp.map((item) => (
                        <Menu.Item key={item.nama} onPress={() => handleSelect(item.nama)} title={item.nama} />
                    ))}
                </Menu> */}
          <Text variant="headlineSmall">Nama Barang</Text>
          <TextInput
            label="Pilih Barang"
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
                onPress={handleOpenDropdown} // Use the updated function
              />
            }
            editable={false}
          />

          <Modal
            visible={open}
            transparent
            animationType="fade"
            onRequestClose={() => setOpen(false)}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.3)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              activeOpacity={1}
              onPress={() => setOpen(false)} // Only close when tapping outside the modal content
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
                        setNama(option.nama);
                        setKode(option.kode);
                        setJenis(option.jenis);
                        setJumlah(option.jumlah.toString());
                        setOpen(false);
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
                  <Button onPress={() => setOpen(false)}>Tutup</Button>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </Modal>
          <Text variant="headlineSmall">Kode Barang</Text>
          {/* <TextInput
                    placeholder="Masukkan Kode"
                    maxLength={30}
                    label={'Harga'}
                    value={harga}
                    onChangeText={setHarga}
                /> */}
          <Menu
            visible={menuVisible && selectedField === 'kode'}
            onDismiss={closeMenu}
            anchor={
              <TextInput
                placeholder="Pilih Kode"
                value={kode}
                disabled
                onFocus={() => openMenu('kode')}
              />
            }
          >
            {filteredProcApp.map((item) => (
              <Menu.Item
                key={item.kode}
                onPress={() => handleSelect(item.kode)}
                title={item.kode}
              />
            ))}
          </Menu>
          <Text variant="headlineSmall">Jenis Barang</Text>
          <Menu
            visible={menuVisible && selectedField === 'jenis'}
            onDismiss={closeMenu}
            anchor={
              <TextInput
                placeholder="Pilih Jenis"
                value={jenis}
                disabled
                onFocus={() => openMenu('jenis')}
              />
            }
          >
            {filteredProcApp.map((item) => (
              <Menu.Item
                key={item.jenis}
                onPress={() => handleSelect(item.jenis)}
                title={item.jenis}
              />
            ))}
          </Menu>
          <Text variant="headlineSmall">Jumlah Barang</Text>
          <Menu
            visible={menuVisible && selectedField === 'jumlah'}
            onDismiss={closeMenu}
            anchor={
              <TextInput
                placeholder="Pilih Jumlah"
                value={jumlah}
                disabled
                onFocus={() => openMenu('jumlah')}
              />
            }
          >
            {filteredProcApp.map((item) => (
              <Menu.Item
                key={item.jumlah}
                onPress={() => handleSelect(item.jumlah)}
                title={item.jumlah}
              />
            ))}
          </Menu>
          <Text variant="headlineSmall">Harga Barang</Text>
          <TextInput
            placeholder="Masukkan Harga"
            keyboardType="numeric"
            maxLength={30}
            label={'Harga'}
            value={harga}
            onChangeText={setHarga}
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
                addSupplierItem(); // Save if all fields are filled
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
