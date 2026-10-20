import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
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
  IconButton,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditBarangPengadaan() {
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(theme, colorScheme);
  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;

  const [visibleInput, setVisibleInput] = useState(false);
  const showDialogInput = () => setVisibleInput(true);
  const hideDialogInput = () => setVisibleInput(false);

  const { id, pengadaan } = useLocalSearchParams();
  const selectedPengadaanId = pengadaan ? Number(pengadaan) : null;
  const [proc, setProc] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async (id) => {
      try {
        const jsonValue = await AsyncStorage.getItem('ProcApp');
        const storageProc = jsonValue != null ? JSON.parse(jsonValue) : null;

        if (storageProc && storageProc.length) {
          const myProc = storageProc.find((item) => item.id.toString() === id);
          setProc(myProc);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData(id);
  }, [id]);

  const handleSave = async () => {
    if (!proc.nama || !proc.kode || !proc.jenis || !proc.jumlah) {
      showDialogInput();
      return;
    }
    try {
      const savedProc = {
        ...proc,
        nama: proc.nama,
        kode: proc.kode,
        jenis: proc.jenis,
        jumlah: proc.jumlah,
      };
      const jsonValue = await AsyncStorage.getItem('ProcApp');
      const storageProc = jsonValue != null ? JSON.parse(jsonValue) : null;

      if (storageProc && storageProc.length) {
        const otherproc = storageProc.filter(
          (item) => item.id !== savedProc.id
        );
        const updatedProc = [...otherproc, savedProc];
        await AsyncStorage.setItem('ProcApp', JSON.stringify(updatedProc));
      } else {
        await AsyncStorage.setItem('ProcApp', JSON.stringify([savedProc]));
      }
      router.push({
        pathname: `/barang-pengadaan`,
        params: {
          pengadaan: selectedPengadaanId,
        },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePress = () => {
    router.push({
      pathname: `/barang-pengadaan`,
      params: {
        pengadaan: selectedPengadaanId,
      },
    });
  };

  return (
    <Container style={styles.container}>
      <View style={styles.title}>
        <IconButton
          icon="keyboard-backspace"
          iconColor={colorScheme === 'dark' ? 'white' : 'black'}
          size={50}
          onPress={handlePress}
        />
        <Text variant="displaySmall" style={styles.titleNameText}>
          Edit{'\n'} Pengadaan Barang
        </Text>
      </View>
      <View style={styles.inputContainerText}>
        <Text variant="headlineSmall">Nama Barang</Text>
        <TextInput
          placeholder="Edit Nama"
          maxLength={30}
          label={'Barang'}
          value={proc?.nama || ''}
          onChangeText={(nama) => setProc((prev) => ({ ...prev, nama }))}
        />
        <Text variant="headlineSmall">Kode Barang</Text>
        <TextInput
          placeholder="Edit Kode"
          maxLength={30}
          label={'Kode'}
          value={proc?.kode || ''}
          onChangeText={(kode) => setProc((prev) => ({ ...prev, kode }))}
        />
        <Text variant="headlineSmall">Jenis Barang</Text>
        <TextInput
          placeholder="Edit Jenis"
          maxLength={30}
          label={'Jenis'}
          value={proc?.jenis || ''}
          onChangeText={(jenis) => setProc((prev) => ({ ...prev, jenis }))}
        />
        <Text variant="headlineSmall">Jumlah Barang</Text>
        <TextInput
          placeholder="Edit Jumlah"
          maxLength={5}
          label={'Jumlah'}
          value={String(proc?.jumlah || '')}
          onChangeText={(jumlah) => setProc((prev) => ({ ...prev, jumlah }))}
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
