import { Colors } from '@/constants/Colors';
import { PENGADAAN_LIST } from '@/data/Pengadaan';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
import { DatePickerModal } from 'react-native-paper-dates';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MenuFormPengadaan() {
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(theme, colorScheme);

  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;

  const [pengadaanList, setPengadaanList] = useState([]);
  const [nama_pengadaan, setNamaPengadaan] = useState('');
  const [instansi_pengadaan, setInstansiPengadaan] = useState('');
  const [tanggal_pengadaan, setTanggalPengadaan] = useState('');
  const [open, setOpen] = useState(false);

  const [visibleInput, setVisibleInput] = useState(false);
  const showDialogInput = () => setVisibleInput(true);
  const hideDialogInput = () => setVisibleInput(false);

  const onDismissSingle = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirmSingle = useCallback(
    (params) => {
      setOpen(false);
      setTanggalPengadaan(params.date.toISOString().split('T')[0]); // Format to YYYY-MM-DD
    },
    [setOpen, setTanggalPengadaan]
  );

  const hasError =
    nama_pengadaan === '' ||
    instansi_pengadaan === '' ||
    tanggal_pengadaan === '';
  const errorText = hasError ? '*Semua field harus diisi' : '';

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('PengadaanList');
        const storagePengadaan =
          jsonValue != null ? JSON.parse(jsonValue) : null;
        if (storagePengadaan && storagePengadaan.length) {
          setPengadaanList(
            storagePengadaan.sort((a, b) => b.id_pengadaan - a.id_pengadaan)
          );
        } else {
          setPengadaanList(
            PENGADAAN_LIST.sort((a, b) => b.id_pengadaan - a.id_pengadaan)
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
        const jsonValue = JSON.stringify(pengadaanList);
        await AsyncStorage.setItem('PengadaanList', jsonValue);
      } catch (e) {
        console.error(e);
      }
    };
    storageData();
  }, [pengadaanList]);

  const addPengadaanAsync = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('PengadaanList');
      const storagePengadaan = jsonValue != null ? JSON.parse(jsonValue) : [];
      const newID =
        storagePengadaan.length > 0 ? storagePengadaan[0].id_pengadaan + 1 : 1;
      const newData = [
        {
          id_pengadaan: newID,
          nama_pengadaan,
          instansi_pengadaan,
          tanggal_pengadaan,
        },
        ...storagePengadaan,
      ];
      await AsyncStorage.setItem('PengadaanList', JSON.stringify(newData));
      setNamaPengadaan('');
      setInstansiPengadaan('');
      setTanggalPengadaan('');
      router.push('/pengadaan');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Container style={styles.container}>
      <View style={styles.title}>
        <IconButton
          icon="keyboard-backspace"
          iconColor={colorScheme === 'dark' ? 'white' : 'black'}
          size={50}
          onPress={() => router.push('/pengadaan')}
        />
        <Text variant="displaySmall" style={styles.titleNameText}>
          Form {'\n'} Pengadaan
        </Text>
      </View>
      <View style={styles.inputContainerText}>
        <Text variant="headlineSmall">Nama Pengadaan</Text>
        <TextInput
          placeholder="Masukkan Nama Pengadaan"
          maxLength={30}
          label={'Nama Pengadaan'}
          value={nama_pengadaan}
          onChangeText={setNamaPengadaan}
        />
        <Text variant="headlineSmall">Instansi Pengadaan</Text>
        <TextInput
          placeholder="Masukkan Instansi"
          maxLength={30}
          label={'Instansi'}
          value={instansi_pengadaan}
          onChangeText={setInstansiPengadaan}
        />
        <Text variant="headlineSmall">Tanggal Pengadaan</Text>
        <TextInput
          placeholder="YYYY-MM-DD"
          maxLength={10}
          label={'Tanggal'}
          disabled
          value={tanggal_pengadaan}
          right={
            <TextInput.Icon icon="calendar" onPress={() => setOpen(true)} />
          }
        />
        <DatePickerModal
          locale="id"
          mode="single"
          visible={open}
          onDismiss={onDismissSingle}
          date={tanggal_pengadaan ? new Date(tanggal_pengadaan) : undefined}
          onConfirm={onConfirmSingle}
          label="Pilih Tanggal"
          saveLabel="Simpan"
          inputMode="start"
          inputFormat="YYYY-MM-DD"
        />
        {/* <TextInput
                    placeholder="YYYY-MM-DD"
                    maxLength={10}
                    label={'Tanggal'}
                    value={tanggal_pengadaan}
                    onChangeText={setTanggalPengadaan}
                /> */}
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
              addPengadaanAsync(); // Save if all fields are filled
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
