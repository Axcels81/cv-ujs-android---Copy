import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Appearance,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/Colors';
import {
  Button,
  Dialog,
  IconButton,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';

import { StatusBar } from 'expo-status-bar';

export default function EditSupplier() {
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(theme, colorScheme);
  // Use ScrollView on web, SafeAreaView otherwise
  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;

  // Get supplier id from URL params
  const { id } = useLocalSearchParams();
  const [pengadaanData, setPengadaanData] = useState([]);
  const [supplier, setSupplier] = useState({});
  const [isPengadaanModalVisible, setIsPengadaanModalVisible] = useState(false);
  const [selectedPengadaan, setSelectedPengadaan] = useState(null);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [visibleInput, setVisibleInput] = useState(false);
  const showDialogInput = () => setVisibleInput(true);
  const hideDialogInput = () => setVisibleInput(false);

  const onDismissSingle = () => setOpen(false);

  const onConfirmSingle = ({ date }) => {
    setOpen(false);
    if (date) {
      // Format date as YYYY-MM-DD
      const formatted = date.toISOString().split('T')[0];
      setSupplier((prev) => ({ ...prev, tanggal_input_supplier: formatted }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // Remove id parameter here
      try {
        if (!id) {
          // id is from the component's props/params
          console.error('No ID provided for fetching supplier data');
          return;
        }

        const jsonValue = await AsyncStorage.getItem('SupplierList');
        const storageSupplier = jsonValue != null ? JSON.parse(jsonValue) : [];

        if (Array.isArray(storageSupplier)) {
          const mySupplier = storageSupplier.find(
            (item) =>
              item &&
              item.id_supplier !== undefined &&
              item.id_supplier !== null &&
              item.id_supplier.toString() === id.toString()
          );

          if (mySupplier) {
            setSupplier(mySupplier);
            // Set the selected pengadaan if it exists
            if (
              mySupplier.id_pengadaan !== undefined &&
              mySupplier.id_pengadaan !== null
            ) {
              const peng = pengadaanData.find(
                (p) =>
                  p &&
                  p.id_pengadaan !== undefined &&
                  p.id_pengadaan === mySupplier.id_pengadaan
              );
              if (peng) setSelectedPengadaan(peng);
            }
          }
        }
      } catch (e) {
        console.error('Error fetching supplier data:', e);
      }
    };

    fetchData(); // Call without parameters
  }, [id, pengadaanData]); // Add pengadaanData to dependencies

  useEffect(() => {
    const fetchPengadaan = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('PengadaanList');
        const data = jsonValue != null ? JSON.parse(jsonValue) : [];
        setPengadaanData(data);
      } catch (error) {
        console.error('Error fetching pengadaan data:', error);
      }
    };
    fetchPengadaan();
  }, []);

  const handleSave = async () => {
    if (
      !supplier.nama_supplier ||
      !supplier.no_telepon ||
      !supplier.tanggal_input_supplier ||
      !selectedPengadaan
    ) {
      showDialogInput(); // Show dialog if any field is empty
      return;
    }
    try {
      if (!selectedPengadaan) {
        alert('Silakan pilih pengadaan terlebih dahulu');
        showDialogInput();
        return;
      }

      const updatedSupplier = {
        ...supplier,
        id_pengadaan: selectedPengadaan.id_pengadaan,
      };

      // ... rest of your save logic
      const jsonValue = await AsyncStorage.getItem('SupplierList');
      const storageSupplier = jsonValue != null ? JSON.parse(jsonValue) : null;

      if (storageSupplier && storageSupplier.length) {
        const otherSuppliers = storageSupplier.filter(
          (item) => item.id_supplier !== updatedSupplier.id_supplier
        );
        const updatedSuppliers = [...otherSuppliers, updatedSupplier].sort(
          (a, b) => b.id_supplier - a.id_supplier
        );
        await AsyncStorage.setItem(
          'SupplierList',
          JSON.stringify(updatedSuppliers)
        );
      } else {
        await AsyncStorage.setItem(
          'SupplierList',
          JSON.stringify([updatedSupplier])
        );
      }

      router.push('/supplier');
    } catch (e) {
      console.error(e);
      showDialogInput();
      alert('Gagal menyimpan data supplier');
    }
  };

  const getNamaPengadaan = (id_pengadaan) => {
    if (id_pengadaan === undefined || id_pengadaan === null) {
      return '-';
    }

    if (!Array.isArray(pengadaanData) || pengadaanData.length === 0) {
      return '-';
    }

    const found = pengadaanData.find((p) => {
      return p.id_pengadaan == id_pengadaan; // Using == for type coercion
    });

    return found ? found.nama_pengadaan : 'Unknown Pengadaan';
  };

  const handleSelectPengadaan = (pengadaan) => {
    setSelectedPengadaan(pengadaan);
    setSupplier((prev) => ({ ...prev, id_pengadaan: pengadaan.id_pengadaan }));
    setIsPengadaanModalVisible(false);
  };

  const fetchPengadaanData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('PengadaanList');
      const data = jsonValue ? JSON.parse(jsonValue) : [];
      setPengadaanData(data);

      // Set initial selected pengadaan if editing
      if (id && !selectedPengadaan) {
        const currentSupplier =
          supplier.id_supplier === id
            ? supplier
            : data.find((s) => s.id_supplier === id);
        if (currentSupplier?.id_pengadaan) {
          const peng = data.find(
            (p) => p.id_pengadaan === currentSupplier.id_pengadaan
          );
          if (peng) setSelectedPengadaan(peng);
        }
      }
    } catch (error) {
      console.error('Error fetching pengadaan data:', error);
    }
  };

  useEffect(() => {
    fetchPengadaanData();
  }, [id]);

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
          Edit{'\n'} Supplier
        </Text>
      </View>
      <View style={styles.inputContainerText}>
        <Text variant="headlineSmall">Nama Supplier</Text>
        <TextInput
          placeholder="Edit Nama Supplier"
          maxLength={30}
          label={'Nama Supplier'}
          value={supplier?.nama_supplier || ''}
          onChangeText={(text) =>
            setSupplier((prev) => ({ ...prev, nama_supplier: text }))
          }
        />
        <Text variant="headlineSmall">No Telepon</Text>
        <TextInput
          placeholder="Edit No Telepon"
          maxLength={15}
          label={'No Telepon'}
          value={supplier?.no_telepon || ''}
          onChangeText={(text) =>
            setSupplier((prev) => ({ ...prev, no_telepon: text }))
          }
          keyboardType="phone-pad"
        />
        {/* <Text variant="headlineSmall">Jumlah Barang</Text>
                <TextInput
                    placeholder="Edit Jumlah Barang"
                    maxLength={6}
                    label={'Jumlah Barang'}
                    value={supplier?.jumlah_barang ? supplier.jumlah_barang: ''}
                    keyboardType="numeric"
                    onChangeText={text =>
                        setSupplier(prev => ({
                            ...prev,
                            jumlah_barang: Number(text.replace(/[^0-9]/g, ''))
                        }))
                    }
                /> */}
        <Text variant="headlineSmall">Tanggal Input</Text>
        <TextInput
          label="Tanggal Supplier"
          value={supplier?.tanggal_input_supplier || ''}
          placeholder="YYYY-MM-DD"
          editable={false}
          disabled
          right={
            <TextInput.Icon icon="calendar" onPress={() => setOpen(true)} />
          }
          onPressIn={() => setOpen(true)}
        />
        <DatePickerModal
          locale="id"
          mode="single"
          visible={open}
          onDismiss={onDismissSingle}
          date={
            supplier?.tanggal_input_supplier
              ? new Date(supplier.tanggal_input_supplier)
              : undefined
          }
          onConfirm={onConfirmSingle}
          label="Pilih Tanggal"
          saveLabel="Simpan"
          inputMode="start"
          inputFormat="YYYY-MM-DD"
        />
        {/* <TextInput
          placeholder="Edit Tanggal Input (YYYY-MM-DD)"
          maxLength={10}
          label={'Tanggal Input'}
          value={supplier?.tanggal_input_supplier || ''}
          onChangeText={(text) =>
            setSupplier((prev) => ({ ...prev, tanggal_input_supplier: text }))
          }
        /> */}
        <Text variant="headlineSmall">Pilih Pengadaan</Text>
        <TouchableOpacity
          disabled
          onPress={() => setIsPengadaanModalVisible(true)}
          style={[styles.selectedPengadaan, { marginBottom: 16 }]}
        >
          <Text style={{ color: theme.text }}>
            {selectedPengadaan
              ? selectedPengadaan.nama_pengadaan
              : 'Pilih Pengadaan...'}
          </Text>
        </TouchableOpacity>

        {/* Add this at the bottom of your component, before the last closing View */}
      </View>
      <View style={styles.buttonGroup}>
        <Button
          mode="contained"
          labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
          buttonColor="#3DA6CC"
          textColor="black"
          onPress={() => router.push('/supplier')}
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
        <Modal
          visible={isPengadaanModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsPengadaanModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 15,
                }}
              >
                <Text variant="headlineSmall">Pilih Pengadaan</Text>
                <Button onPress={() => setIsPengadaanModalVisible(false)}>
                  Tutup
                </Button>
              </View>

              <ScrollView>
                {pengadaanData.map((pengadaan) => (
                  <TouchableOpacity
                    key={pengadaan.id_pengadaan}
                    style={[
                      styles.pengadaanItem,
                      selectedPengadaan?.id_pengadaan ===
                        pengadaan.id_pengadaan && {
                        backgroundColor: theme.primary + '20',
                      },
                    ]}
                    onPress={() => handleSelectPengadaan(pengadaan)}
                  >
                    <Text style={{ color: theme.text }}>
                      {pengadaan.nama_pengadaan}
                    </Text>
                    <Text
                      style={{ color: theme.text, opacity: 0.7, fontSize: 12 }}
                    >
                      {pengadaan.instansi_pengadaan}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: theme.background,
      margin: 20,
      borderRadius: 10,
      padding: 20,
      maxHeight: '80%',
    },
    pengadaanItem: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    selectedPengadaan: {
      padding: 15,
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: 5,
      backgroundColor: theme.background,
    },
  });
}
