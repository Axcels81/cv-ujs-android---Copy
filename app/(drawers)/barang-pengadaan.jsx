import { BARANG_ITEM } from '@/data/BarangPengadaan';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  Link,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Appearance,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, Dialog, Divider, Portal, Searchbar } from 'react-native-paper';
import { LinearTransition } from 'react-native-reanimated';

export default function MenuBarangPengadaan() {
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const styles = createStyles(theme, colorScheme);

  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;

  const [proc, setProc] = useState([]);
  const [nama, setNama] = useState('');
  const [kode, setKode] = useState('');
  const [jenis, setJenis] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [tempID, setTempID] = useState('');
  const [visible, setVisible] = useState(false);
  const [visibleDetail, setVisibleDetail] = useState(false);
  const [dataDetail, setDataDetail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const { pengadaan } = useLocalSearchParams();
  const selectedPengadaanId = pengadaan ? Number(pengadaan) : null;

  const router = useRouter();

  const showDialogDetail = (item) => {
    setVisibleDetail(true), setDataDetail(item);
  };
  const hideDialogDetail = () => {
    setVisibleDetail(false), setDataDetail([]);
  };
  // const showModal = () => setVisible(true)
  // const hideModal = () => setVisible(false)

  const modalStyle = {
    backgroundColor: theme.background,
  };

  const separatorComponent = <View style={styles.separator} />;

  const footerComponent = (
    <Text style={{ color: theme.text }}>Data Terakhir</Text>
  );

  const emptyComponent = (
    <Text style={{ color: theme.text }}>Data Tidak Ditemukan!</Text>
  );

  useFocusEffect(
    useCallback(() => {
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
    }, [BARANG_ITEM])
  );

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

  const removeProc = (id) => {
    setSearchQuery('');
    setProc(proc.filter((procs) => procs.id !== id));
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = proc.filter(
      (item) =>
        item.nama
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase()) ||
        item.kode
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase()) ||
        item.jenis
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase()) ||
        item.jumlah
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase())
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    if (!searchQuery) {
      setFilteredData(proc);
    }
  }, [proc]);

  const handlePress = (id) => {
    // router.push(`/barang_pengadaan/${id}`)
    setSearchQuery('');
    router.push({
      pathname: `/barang_pengadaan/${id}`,
      params: {
        pengadaan: selectedPengadaanId,
      },
    });
  };

  return (
    <Container style={styles.contentContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <Link
          href={{
            pathname: '/form-barang-pengadaan',
            params: { pengadaan: selectedPengadaanId },
          }}
          asChild
        >
          <Button icon="plus" mode="contained" style={styles.button}>
            <Text style={styles.buttonText}>Tambah Barang</Text>
          </Button>
        </Link>
        <Searchbar
          placeholder="Search"
          onChangeText={handleSearch}
          value={searchQuery}
          style={{ flex: 1 }}
        />
        {/* <IconButton
                        icon="magnify"
                        iconColor={'gray'}
                        size={20}
                        onPress={() => console.log('Pressed')}
                    /> */}
      </View>
      <FlatList
        data={
          selectedPengadaanId
            ? searchQuery
              ? filteredData.filter(
                  (item) => item.id_pengadaan === selectedPengadaanId
                )
              : proc.filter((item) => item.id_pengadaan === selectedPengadaanId)
            : searchQuery
            ? filteredData
            : proc
        }
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        ItemSeparatorComponent={separatorComponent}
        ListFooterComponent={footerComponent}
        ListFooterComponentStyle={styles.footerComponent}
        ListEmptyComponent={emptyComponent}
        ListHeaderComponentStyle={styles.footerComponent}
        itemLayoutAnimation={LinearTransition}
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => {
          return (
            <View style={styles.row}>
              <View style={styles.dataMenuRow}>
                <View style={{ padding: 1, flexDirection: 'row' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dataItemText}>Nama Barang</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.dataItemText}>: </Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={styles.dataItemText}>
                      {item.nama.substring(0, 13)}{' '}
                    </Text>
                  </View>
                </View>
                <View style={{ padding: 1, flexDirection: 'row' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dataItemText}>Kode Barang</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.dataItemText}>: </Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={styles.dataItemText}>
                      {item.kode.substring(0, 13)}{' '}
                    </Text>
                  </View>
                </View>
                <View style={{ padding: 1, flexDirection: 'row' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dataItemText}>Jenis Barang</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.dataItemText}>: </Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={styles.dataItemText}>
                      {item.jenis.substring(0, 13)}{' '}
                    </Text>
                  </View>
                </View>
                <View style={{ padding: 1, flexDirection: 'row' }}>
                  {/* <View style={{flex :1}}>
                                        <Text style={styles.dataItemText}>Jumlah Barang</Text>
                                    </View>
                                    <View style={{flex :1, alignItems:'center'}}>
                                        <Text style={styles.dataItemText}>: </Text>
                                    </View>
                                    <View style={{flex :1, alignItems:'flex-end'}}>
                                        <Text style={styles.dataItemText}>{item.jumlah} </Text>
                                    </View> */}
                </View>
                <Divider />
                <Button
                  icon="chevron-right"
                  mode="text"
                  textColor="gray"
                  onPress={() => showDialogDetail(item)}
                  contentContainerStyle={modalStyle}
                  style={{ marginHorizontal: 'auto' }}
                >
                  Detail
                </Button>
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Pressable
                  onPress={() => removeProc(item.id)}
                  style={{ paddingTop: 15, paddingRight: 10 }}
                >
                  <MaterialIcons
                    name="delete"
                    size={24}
                    color={theme.icon}
                    selectable={undefined}
                  />
                </Pressable>
                <Pressable
                  onPress={() => handlePress(item.id)}
                  style={{ paddingTop: 15, paddingRight: 10 }}
                >
                  <Feather
                    name="edit"
                    size={24}
                    color={theme.icon}
                    selectable={undefined}
                  />
                </Pressable>

                <Portal>
                  {/* <Modal visible={visible} onDismiss={() => hideModal(tempID)} contentContainerStyle={modalStyle}>
                                        <View style={styles.container}>
                                            <View style={styles.inputContainer}>
                                                <Text style={styles.titleName}>Nama Barang</Text>
                                                <TextInput 
                                                    style={styles.input}
                                                    placeholder="Masukkan Nama"
                                                    placeholderTextColor="gray"
                                                    value={nama}
                                                    onChangeText={setNama}
                                                />
                                                <Text style={styles.titleName}>Kode Barang</Text>
                                                <TextInput 
                                                    style={styles.input}
                                                    placeholder="Masukkan Kode"
                                                    placeholderTextColor="gray"
                                                    value={kode}
                                                    onChangeText={setKode}
                                                />
                                                <Text style={styles.titleName}>Jenis Barang</Text>
                                                <TextInput 
                                                    style={styles.input}
                                                    placeholder="Masukkan Jenis"
                                                    placeholderTextColor="gray"
                                                    value={jenis}
                                                    onChangeText={setJenis}
                                                />
                                                <Text style={styles.titleName}>Jumlah Barang</Text>
                                                <TextInput 
                                                    style={styles.input}
                                                    placeholder="Masukkan Jumlah"
                                                    placeholderTextColor="gray"
                                                    value={jumlah}
                                                    onChangeText={setJumlah}
                                                />
                                                <View style={{flexDirection: 'row', padding:10}}>
                                                    <Pressable onPress={() => updateProc(tempID)} style={styles.addButton}>
                                                        <Text style={styles.addButtonText}>Simpan</Text>
                                                    </Pressable>
                                                </View>
                                            </View>
                                        </View>
                                    </Modal> */}
                  <Dialog
                    visible={visibleDetail}
                    onDismiss={() => hideDialogDetail(item)}
                  >
                    <Dialog.Title>Detail Produk Barang</Dialog.Title>
                    <Dialog.Content>
                      <View style={{ padding: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.dataItemText}>Nama Barang</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                          <Text style={styles.dataItemText}>: </Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <Text style={styles.dataItemText}>
                            {dataDetail.nama}{' '}
                          </Text>
                        </View>
                      </View>
                      <View style={{ padding: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.dataItemText}>Kode Barang</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                          <Text style={styles.dataItemText}>: </Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <Text style={styles.dataItemText}>
                            {dataDetail.kode}{' '}
                          </Text>
                        </View>
                      </View>
                      <View style={{ padding: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.dataItemText}>Jenis Barang</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                          <Text style={styles.dataItemText}>: </Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <Text style={styles.dataItemText}>
                            {dataDetail.jenis}{' '}
                          </Text>
                        </View>
                      </View>
                      <View style={{ padding: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.dataItemText}>Jumlah Barang</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                          <Text style={styles.dataItemText}>: </Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <Text style={styles.dataItemText}>
                            {dataDetail.jumlah}{' '}
                          </Text>
                        </View>
                      </View>
                    </Dialog.Content>
                    <Dialog.Actions>
                      <Button onPress={() => hideDialogDetail(item)}>
                        Selesai
                      </Button>
                    </Dialog.Actions>
                  </Dialog>
                </Portal>

                {/* <Link href="/form-edit-barang-pengadaan" style={{ marginHorizontal: 'auto'}} asChild>
                                    <Pressable onPress={() => onSubmit(item.id)} style={{paddingTop:15, paddingRight:10}}>
                                        <Feather name="edit" size={24} color={theme.icon} selectable={undefined} />
                                    </Pressable>
                                </Link> */}
              </View>
            </View>
          );
        }}
      />
    </Container>
  );
}

function createStyles(theme, colorScheme) {
  return StyleSheet.create({
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
      height: 120,
      marginBottom: 10,
      borderStyle: 'solid',
      borderColor: colorScheme === 'dark' ? 'papayawhip' : '#000',
      borderWidth: 1,
      borderRadius: 20,
      overflow: 'hidden',
      marginHorizontal: 'auto',
    },
    dataMenuRow: {
      width: '85%',
      paddingTop: 10,
      paddingLeft: 10,
      paddingRight: 5,
      flexGrow: 1,
    },
    dataItemText: {
      color: theme.text,
    },
    button: {
      backgroundColor: colorScheme === 'dark' ? 'white' : '#000',
      justifyContent: 'flex-start',
    },
    buttonText: {
      color: colorScheme === 'dark' ? 'black' : 'white',
      fontSize: 16,
      textAlign: 'center',
      padding: 4,
    },
  });
}
