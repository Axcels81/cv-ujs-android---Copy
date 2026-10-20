import { Colors } from '@/constants/Colors';
import { SUPPLIER_LIST } from '@/data/Supplier';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
import { DatePickerModal } from 'react-native-paper-dates';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MenuFormSupplier() {
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(theme, colorScheme);

  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;

  const [supplierList, setSupplierList] = useState([]);
  const [nama_supplier, setNamaSupplier] = useState('');
  const [id_pengadaan, setIdPengadaan] = useState('');
  const [no_telepon, setNoTelepon] = useState('');
  const [jumlah_barang, setJumlahBarang] = useState('');
  const [tanggal_input_supplier, setTanggalInputSupplier] = useState('');
  const [open, setOpen] = useState(false);
  const [dropDownOpen, setdropDownOpen] = useState(false);

  const [visibleInput, setVisibleInput] = useState(false);
  const showDialogInput = () => setVisibleInput(true);
  const hideDialogInput = () => setVisibleInput(false);

  const router = useRouter();

  // For dropdown
  const [pengadaanOptions, setPengadaanOptions] = useState([]);

  useEffect(() => {
    const fetchPengadaanOptions = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('PengadaanList');
        const storagePengadaan = jsonValue != null ? JSON.parse(jsonValue) : [];
        setPengadaanOptions(storagePengadaan);
      } catch (e) {
        console.error(e);
      }
    };

    fetchPengadaanOptions();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('SupplierList');
        const storageSupplier =
          jsonValue != null ? JSON.parse(jsonValue) : null;
        if (storageSupplier && storageSupplier.length) {
          setSupplierList(
            storageSupplier.sort((a, b) => b.id_supplier - a.id_supplier)
          );
        } else {
          setSupplierList(
            SUPPLIER_LIST.sort((a, b) => b.id_supplier - a.id_supplier)
          );
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const storageData = async () => {
      try {
        const jsonValue = JSON.stringify(supplierList);
        await AsyncStorage.setItem('SupplierList', jsonValue);
      } catch (e) {
        console.error(e);
      }
    };
    storageData();
  }, [supplierList]);

  const onDismissSingle = useCallback(() => {
    setdropDownOpen(false);
  }, [setdropDownOpen]);

  const onConfirmSingle = useCallback(
    (params) => {
      setdropDownOpen(false);
      setTanggalInputSupplier(params.date.toISOString().split('T')[0]); // Format to YYYY-MM-DD
    },
    [setdropDownOpen, setTanggalInputSupplier]
  );

  const hasError =
    nama_supplier === '' ||
    id_pengadaan === '' ||
    no_telepon === '' ||
    tanggal_input_supplier === '';
  const errorText = hasError ? '*Semua field harus diisi' : '';

  const addSupplierAsync = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('SupplierList');
      const storageSupplier = jsonValue != null ? JSON.parse(jsonValue) : [];
      const newID =
        storageSupplier.length > 0 ? storageSupplier[0].id_supplier + 1 : 1;
      const newData = [
        {
          id_supplier: newID,
          id_pengadaan: Number(id_pengadaan),
          nama_supplier,
          no_telepon,
          tanggal_input_supplier,
        },
        ...storageSupplier,
      ];
      await AsyncStorage.setItem('SupplierList', JSON.stringify(newData));
      setNamaSupplier('');
      setNoTelepon('');
      setTanggalInputSupplier('');
      router.push('/supplier');
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenDropdown = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('PengadaanList');
      const storagePengadaan = jsonValue != null ? JSON.parse(jsonValue) : [];
      setPengadaanOptions(storagePengadaan);
      setOpen(true); // Open the modal
    } catch (e) {
      console.error(e);
    }
  };

  // Date picker logic (manual, since react-native-paper-dates is not imported here)
  const handleDateChange = (text) => {
    setTanggalInputSupplier(text);
  };

  return (
    <Container style={styles.container}>
      <View style={styles.title}>
        <IconButton
          icon="keyboard-backspace"
          iconColor={colorScheme === 'dark' ? 'white' : 'black'}
          size={50}
          onPress={() => router.push('/supplier')}
        />
        <Text variant="displaySmall" style={styles.titleNameText}>
          Form {'\n'} Supplier
        </Text>
      </View>
      <View style={styles.inputContainerText}>
        <Text variant="headlineSmall">Nama Supplier</Text>
        <TextInput
          placeholder="Masukkan Nama Supplier"
          maxLength={30}
          label={'Nama Supplier'}
          value={nama_supplier}
          onChangeText={setNamaSupplier}
        />
        <Text variant="headlineSmall">Nama Pengadaan</Text>
        <TextInput
          label="Pilih Pengadaan"
          value={
            id_pengadaan
              ? pengadaanOptions.find(
                  (p) => p.id_pengadaan === Number(id_pengadaan)
                )?.nama_pengadaan || ''
              : ''
          }
          placeholder="Pilih Pengadaan"
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
                    setOpen(false);
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
              <Button onPress={() => setOpen(false)}>Tutup</Button>
            </View>
          </TouchableOpacity>
        </Modal>
        <Text variant="headlineSmall">No Telepon</Text>
        <TextInput
          placeholder="Masukkan No Telepon"
          maxLength={15}
          label={'No Telepon'}
          value={no_telepon}
          keyboardType="phone-pad"
          onChangeText={setNoTelepon}
        />
        {/* <Text variant="headlineSmall">Jumlah Barang</Text>
                <TextInput
                    placeholder="Masukkan Jumlah Barang"
                    maxLength={6}
                    label={'Jumlah Barang'}
                    value={jumlah_barang}
                    keyboardType="numeric"
                    onChangeText={text => setJumlahBarang(text.replace(/[^0-9]/g, ''))}
                /> */}
        <Text variant="headlineSmall">Tanggal Input</Text>
        <TextInput
          placeholder="YYYY-MM-DD"
          maxLength={10}
          label={'Tanggal'}
          disabled
          value={tanggal_input_supplier}
          right={
            <TextInput.Icon
              icon="calendar"
              onPress={() => setdropDownOpen(true)}
            />
          }
        />
        <DatePickerModal
          locale="id"
          mode="single"
          visible={dropDownOpen}
          onDismiss={onDismissSingle}
          date={
            tanggal_input_supplier
              ? new Date(tanggal_input_supplier)
              : undefined
          }
          onConfirm={onConfirmSingle}
          label="Pilih Tanggal"
          saveLabel="Simpan"
          inputMode="start"
          inputFormat="YYYY-MM-DD"
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
              addSupplierAsync(); // Save if all fields are filled
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
