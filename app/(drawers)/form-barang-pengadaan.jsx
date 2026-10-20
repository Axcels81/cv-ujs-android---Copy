import { BARANG_ITEM } from '@/data/BarangPengadaan';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Appearance,
  Platform,
  ScrollView,
  StyleSheet,
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
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from 'react';
import XLSX from 'xlsx';

export default function MenuFormBarangPengadaan() {
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const styles = createStyles(theme, colorScheme);

  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;

  const [proc, setProc] = useState([]);
  const [nama, setNama] = useState('');
  const [kode, setKode] = useState('');
  const [jenis, setJenis] = useState('');
  const [jumlah, setJumlah] = useState('');
  const { pengadaan } = useLocalSearchParams();
  const selectedPengadaanId = pengadaan ? Number(pengadaan) : null;

  const [visibleInput, setVisibleInput] = useState(false);
  const showDialogInput = () => setVisibleInput(true);
  const hideDialogInput = () => setVisibleInput(false);

  const hasError = nama === '' || kode === '' || jenis === '' || jumlah === '';
  const errorText = hasError ? '*Semua field harus diisi' : '';

  const numError = () => {
    if (jumlah !== '' && isNaN(jumlah)) {
      return '*Jumlah harus berupa angka';
    }
    return '';
  };

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('ProcApp');
        const storageProc = jsonValue != null ? JSON.parse(jsonValue) : null;

        // if (storageProc && storageProc.length) {
        //     setProc(storageProc)
        // } else {
        //     setProc(BARANG_ITEM)
        // }

        if (storageProc && storageProc.length) {
          setProc(storageProc.sort((a, b) => b.id - a.id));
        } else {
          setProc(BARANG_ITEM.sort((a, b) => b.id - a.id));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [BARANG_ITEM]);

  useEffect(() => {
    const storageData = async () => {
      try {
        const jsonValue = JSON.stringify(proc);
        await AsyncStorage.setItem('ProcApp', jsonValue);
      } catch (e) {
        console.error(e);
      }
    };

    storageData();
  }, [proc]);

  const addProc = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('ProcApp');
      const storageProc = jsonValue != null ? JSON.parse(jsonValue) : [];
      const newID = storageProc.length > 0 ? storageProc[0].id + 1 : 1;
      const newData = [
        {
          id: newID,
          nama,
          kode,
          jenis,
          jumlah,
          id_pengadaan: selectedPengadaanId,
        },
        ...storageProc,
      ];
      await AsyncStorage.setItem('ProcApp', JSON.stringify(newData));
      setNama('');
      setKode('');
      setJenis('');
      setJumlah('');
    } catch (e) {
      console.error(e);
    }
  };
  const addProcRed = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('ProcApp');
      const storageProc = jsonValue != null ? JSON.parse(jsonValue) : [];
      const newID = storageProc.length > 0 ? storageProc[0].id + 1 : 1;
      const newData = [
        {
          id: newID,
          nama,
          kode,
          jenis,
          jumlah,
          id_pengadaan: selectedPengadaanId,
        },
        ...storageProc,
      ];
      await AsyncStorage.setItem('ProcApp', JSON.stringify(newData));
      setNama('');
      setKode('');
      setJenis('');
      setJumlah('');
      router.push({
        pathname: '/barang-pengadaan',
        params: { pengadaan: selectedPengadaanId },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const importFromExcel = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: '*/*' });

      // Support old API (res.type === 'success') and new API (res.assets)
      if (res.type && res.type !== 'success') {
        alert('Dokumen dibatalkan');
        return;
      }
      if (res.canceled === true) {
        alert('Dokumen dibatalkan');
        return;
      }

      // normalize file info
      let fileUri = res.uri ?? res?.assets?.[0]?.uri;
      const fileName = res.name ?? res?.assets?.[0]?.name ?? 'import.xlsx';
      if (!fileUri) {
        alert('Tidak dapat membaca file. Periksa kembali pemilihan file.');
        return;
      }

      // copy content:// -> file:// on Android if needed
      if (fileUri.startsWith('content://') || !fileUri.startsWith('file://')) {
        const dest = `${FileSystem.cacheDirectory}${fileName}`;
        const info = await FileSystem.getInfoAsync(dest);
        if (info.exists) {
          await FileSystem.deleteAsync(dest, { idempotent: true });
        }
        await FileSystem.copyAsync({ from: fileUri, to: dest });
        fileUri = dest;
      }

      // read as base64 (preferred)
      let b64;
      try {
        b64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (err) {
        console.warn('readAsStringAsync(base64) failed, will fallback', err);
      }

      let wb;
      if (b64) {
        wb = XLSX.read(b64, { type: 'base64' });
      } else {
        const raw = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        wb = XLSX.read(raw, { type: 'binary' });
      }

      if (!wb || !wb.SheetNames?.length) {
        alert('Gagal membaca file excel: tidak ada sheet ditemukan.');
        return;
      }

      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (!rawRows.length) {
        alert('File excel kosong, harap masukkan data yang valid.');
        return;
      }

      const jsonValue = await AsyncStorage.getItem('ProcApp');
      const storageProc = jsonValue ? JSON.parse(jsonValue) : [];
      const startId = storageProc.length > 0 ? storageProc[0].id + 1 : 1;

      const rows = rawRows.map((row, idx) => ({
        id: startId + idx,
        nama:
          row.Nama ||
          row.nama ||
          row['Nama Barang'] ||
          row['nama barang'] ||
          '',
        kode:
          row.Kode ||
          row.kode ||
          row['Kode Barang'] ||
          row['kode barang'] ||
          '',
        jenis: row.Jenis || row.jenis || row['Jenis'] || '',
        jumlah: String(
          row.Jumlah || row.jumlah || row['Jumlah'] || row['jumlah'] || '0'
        ),
        id_pengadaan: selectedPengadaanId,
      }));

      const validRows = rows.filter((r) => r.nama && r.nama.trim() !== '');
      if (!validRows.length) {
        alert(
          'Tidak ada baris valid. Periksa header kolom (contoh: Nama, Kode, Jumlah).'
        );
        return;
      }

      const newData = [...validRows, ...storageProc];
      await AsyncStorage.setItem('ProcApp', JSON.stringify(newData));
      setProc(newData);
      alert(`Berhasil mengimpor ${validRows.length} baris`);
      setNama('');
      setKode('');
      setJenis('');
      setJumlah('');
      router.push({
        pathname: '/barang-pengadaan',
        params: { pengadaan: selectedPengadaanId },
      });
    } catch (e) {
      console.error('Import Excel failed', e);
      alert('Import gagal. Harap Masukkan File Dengan Format yang Benar.');
    }
  };

  const updateProc = (id) => {
    setProc(
      proc.map((procs) =>
        procs.id === id
          ? { ...procs, nama: nama, kode: kode, jenis: jenis, jumlah: jumlah }
          : procs
      )
    );
    setNama('');
    setKode('');
    setJenis('');
    setJumlah('');
  };

  const removeProc = (id) => {
    setProc(proc.filter((procs) => proc.id !== id));
  };

  return (
    // <Container style={styles.container}>
    //     <View style={styles.inputContainer}>
    //         <Text style={styles.titleName}>Nama Barang</Text>
    //         <TextInput
    //             style={styles.inputText}
    //             placeholder="Masukkan Nama"
    //             label={'Barang'}
    //             value={nama}
    //             onChangeText={setNama}
    //         />
    //         <Text style={styles.titleName}>Kode Barang</Text>
    //         <TextInput
    //             style={styles.input}
    //             placeholder="Masukkan Kode"
    //             placeholderTextColor="gray"
    //             value={kode}
    //             onChangeText={setKode}
    //         />
    //         <Text style={styles.titleName}>Jenis Barang</Text>
    //         <TextInput
    //             style={styles.input}
    //             placeholder="Masukkan Jenis"
    //             placeholderTextColor="gray"
    //             value={jenis}
    //             onChangeText={setJenis}
    //         />
    //         <Text style={styles.titleName}>Jumlah Barang</Text>
    //         <TextInput
    //             style={styles.input}
    //             placeholder="Masukkan Jumlah"
    //             placeholderTextColor="gray"
    //             value={jumlah}
    //             onChangeText={setJumlah}
    //         />
    //         <View style={{flexDirection: 'row', paddingTop: 10}}>
    //             <Link href="/barang-pengadaan" style={{ marginHorizontal: 'auto'}} prefetch>
    //                 <Pressable onPress={addProc} style={styles.addButton}>
    //                     <Text style={styles.addButtonText}>Simpan</Text>
    //                 </Pressable>
    //             </Link>
    //             <Pressable onPress={addProc} style={styles.addButton}>
    //                 <Text style={styles.addButtonText}>Tambah Barang</Text>
    //             </Pressable>
    //         </View>
    //     </View>
    // </Container>
    <Container style={styles.container}>
      <View style={styles.title}>
        <IconButton
          icon="keyboard-backspace"
          iconColor={colorScheme === 'dark' ? 'white' : 'black'}
          size={50}
          onPress={() =>
            router.push({
              pathname: '/barang-pengadaan',
              params: { pengadaan: selectedPengadaanId },
            })
          }
        />
        <Text variant="displaySmall" style={styles.titleNameText}>
          Form {'\n'} Pengadaan Barang
        </Text>
      </View>
      <View style={styles.inputContainerText}>
        <Text variant="headlineSmall">Nama Barang</Text>
        <TextInput
          placeholder="Masukkan Nama"
          maxLength={30}
          label={'Barang'}
          value={nama}
          onChangeText={setNama}
        />
        <Text variant="headlineSmall">Kode Barang</Text>
        <TextInput
          placeholder="Masukkan Kode"
          maxLength={30}
          label={'Kode'}
          value={kode}
          onChangeText={setKode}
        />
        <Text variant="headlineSmall">Jenis Barang</Text>
        <TextInput
          placeholder="Masukkan Jenis"
          maxLength={30}
          label={'Jenis'}
          value={jenis}
          onChangeText={setJenis}
        />
        <Text variant="headlineSmall">Jumlah Barang</Text>
        <View>
          <TextInput
            placeholder="Masukkan Jumlah"
            maxLength={5}
            label={'Jumlah'}
            value={jumlah}
            keyboardType="numeric"
            inputMode="numeric"
            onChangeText={setJumlah}
          />
          <HelperText type="error" visible={numError() !== ''}>
            {numError()}
          </HelperText>
        </View>
        <HelperText type="info" visible={hasError}>
          {errorText}
        </HelperText>
      </View>
      <View style={styles.buttonGroup}>
        <Button
          mode="contained"
          labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
          buttonColor="#A7E585"
          textColor="black"
          onPress={() => {
            if (hasError) {
              showDialogInput(); // Show dialog if any field is empty
            } else {
              addProc(); // Save if all fields are filled
            }
          }}
        >
          Tambah Barang
        </Button>
        <Button
          mode="contained"
          labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
          buttonColor="#3DA6CC"
          textColor="black"
          onPress={() => {
            if (hasError) {
              showDialogInput(); // Show dialog if any field is empty
            } else {
              addProcRed(); // Save if all fields are filled
            }
          }}
        >
          Simpan
        </Button>

        <Button
          mode="contained"
          labelStyle={{ fontSize: 16, fontWeight: '600' }}
          buttonColor="#FFB74D"
          textColor="black"
          onPress={importFromExcel}
        >
          Import Excel
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
    titleName: {
      fontsize: 42,
      fontWeight: 'bold',
      color: theme.text,
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
    inputContainer: {
      alignItems: 'center',
      marginBottom: 10,
      padding: 10,
      gap: 6,
      width: '100%',
      marginHorizontal: 'auto',
      pointerEvents: 'auto',
      borderRadius: 15,
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
    inputText: {
      flex: 1,
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 5,
      padding: 20,
      marginRight: 10,
      minWidth: 0,
      fontsize: 18,
    },
    input: {
      flex: 1,
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 5,
      padding: 10,
      marginRight: 10,
      fontSize: 18,
      minWidth: 0,
      color: theme.text,
    },
    addButton: {
      backgroundColor: colorScheme === 'dark' ? 'white' : '#000',
      borderRadius: 5,
      padding: 10,
    },
    addButtonText: {
      fontSize: 18,
      color: 'black',
    },
    contentContainer: {
      paddingTop: 10,
      paddingBottom: 20,
      paddingHorizontal: 12,
      backgroundColor: theme.background,
    },
    separator: {
      height: 1,
      backgroundColor: colorScheme === 'dark' ? 'papayawhip' : '#000',
      width: '50%',
      maxWidth: 300,
      marginHorizontal: 'auto',
      marginBottom: 10,
    },
    footerComponent: {
      marginHorizontal: 'auto',
    },
    row: {
      flexDirection: 'row',
      width: '100%',
      maxWidth: 600,
      height: 100,
      marginBottom: 10,
      borderStyle: 'solid',
      borderColor: colorScheme === 'dark' ? 'papayawhip' : '#000',
      borderWidth: 1,
      borderRadius: 20,
      overflow: 'hidden',
      marginHorizontal: 'auto',
    },
    dataMenuRow: {
      width: '65%',
      paddingTop: 10,
      paddingLeft: 10,
      paddingRight: 10,
      flexGrow: 1,
    },
    dataItemText: {
      color: theme.text,
    },
  });
}
