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
import { DatePickerModal } from 'react-native-paper-dates';

export default function EditPengadaan() {
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(theme, colorScheme);
  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;

  const [visibleInput, setVisibleInput] = useState(false);
  const showDialogInput = () => setVisibleInput(true);
  const hideDialogInput = () => setVisibleInput(false);
  const [open, setOpen] = useState(false);

  const { id } = useLocalSearchParams();
  const [pengadaan, setPengadaan] = useState({});
  const router = useRouter();

  const onDismissSingle = () => setOpen(false);

  const onConfirmSingle = ({ date }) => {
    setOpen(false);
    if (date) {
      // Format date as YYYY-MM-DD
      const formatted = date.toISOString().split('T')[0];
      setPengadaan((prev) => ({ ...prev, tanggal_pengadaan: formatted }));
    }
  };

  useEffect(() => {
    const fetchData = async (id) => {
      try {
        const jsonValue = await AsyncStorage.getItem('PengadaanList');
        const storagePengadaan =
          jsonValue != null ? JSON.parse(jsonValue) : null;
        if (storagePengadaan && storagePengadaan.length) {
          const myPengadaan = storagePengadaan.find(
            (item) => item.id_pengadaan.toString() === id
          );
          setPengadaan(myPengadaan || {});
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData(id);
  }, [id]);

  const handleSave = async () => {
    if (
      !pengadaan.nama_pengadaan ||
      !pengadaan.instansi_pengadaan ||
      !pengadaan.tanggal_pengadaan
    ) {
      showDialogInput();
      return;
    }
    try {
      const savedPengadaan = { ...pengadaan };
      const jsonValue = await AsyncStorage.getItem('PengadaanList');
      const storagePengadaan = jsonValue != null ? JSON.parse(jsonValue) : null;

      if (storagePengadaan && storagePengadaan.length) {
        const otherPengadaan = storagePengadaan.filter(
          (item) => item.id_pengadaan !== savedPengadaan.id_pengadaan
        );
        const updatedPengadaan = [...otherPengadaan, savedPengadaan].sort(
          (a, b) => b.id_pengadaan - a.id_pengadaan
        );
        await AsyncStorage.setItem(
          'PengadaanList',
          JSON.stringify(updatedPengadaan)
        );
      } else {
        await AsyncStorage.setItem(
          'PengadaanList',
          JSON.stringify([savedPengadaan])
        );
      }
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
          Edit{'\n'} Pengadaan
        </Text>
      </View>
      <View style={styles.inputContainerText}>
        <Text variant="headlineSmall">Nama Pengadaan</Text>
        <TextInput
          placeholder="Edit Nama Pengadaan"
          maxLength={30}
          label={'Nama Pengadaan'}
          value={pengadaan?.nama_pengadaan || ''}
          onChangeText={(nama_pengadaan) =>
            setPengadaan((prev) => ({ ...prev, nama_pengadaan }))
          }
        />
        <Text variant="headlineSmall">Instansi Pengadaan</Text>
        <TextInput
          placeholder="Edit Instansi"
          maxLength={30}
          label={'Instansi'}
          value={pengadaan?.instansi_pengadaan || ''}
          onChangeText={(instansi_pengadaan) =>
            setPengadaan((prev) => ({ ...prev, instansi_pengadaan }))
          }
        />
        <Text variant="headlineSmall">Tanggal Pengadaan</Text>
        <TextInput
          label="Tanggal Pengadaan"
          value={pengadaan?.tanggal_pengadaan || ''}
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
            pengadaan?.tanggal_pengadaan
              ? new Date(pengadaan.tanggal_pengadaan)
              : undefined
          }
          onConfirm={onConfirmSingle}
          label="Pilih Tanggal"
          saveLabel="Simpan"
          inputMode="start"
          inputFormat="YYYY-MM-DD"
        />
        {/* <TextInput
          placeholder="Edit Tanggal"
          maxLength={10}
          label={'Tanggal'}
          value={pengadaan?.tanggal_pengadaan || ''}
          onChangeText={(tanggal_pengadaan) =>
            setPengadaan((prev) => ({ ...prev, tanggal_pengadaan }))
          }
        /> */}
      </View>
      <View style={styles.buttonGroup}>
        <Button
          mode="contained"
          labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
          buttonColor="#3DA6CC"
          textColor="black"
          onPress={() => router.push('/pengadaan')}
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
