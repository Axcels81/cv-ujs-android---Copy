import { Colors } from '@/constants/Colors';
import { PENGADAAN_LIST } from '@/data/Pengadaan';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useFocusEffect, useRouter } from 'expo-router';
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
import { Button, Dialog, Divider, Portal, Searchbar } from 'react-native-paper';
import { LinearTransition } from 'react-native-reanimated';

export default function MenuBarangPengadaan() {
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const styles = createStyles(theme, colorScheme);

  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;
  const [pengadaanList, setPengadaanList] = useState([]);
  const [nama_pengadaan, setNamaPengadaan] = useState('');
  const [instansi_pengadaan, setInstansiPengadaan] = useState('');
  const [tanggal_pengadaan, setTanggalPengadaan] = useState('');

  const [visibleDetail, setVisibleDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const [dataDetail, setDataDetail] = useState('');
  const router = useRouter();

  const showDialogDetail = (item) => {
    setVisibleDetail(true), setDataDetail(item);
  };
  const hideDialogDetail = () => {
    setVisibleDetail(false), setDataDetail([]);
  };

  const modalStyle = {
    backgroundColor: theme.background,
  };

  const separatorComponent = <View style={styles.separator} />;

  const footerComponent = (
    <Text style={{ color: theme.text }}>Data Pengadaan Terakhir</Text>
  );

  const emptyComponent = (
    <Text style={{ color: theme.text }}>Data Pengadaan Tidak Ditemukan!</Text>
  );

  useFocusEffect(
    useCallback(() => {
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
    }, [PENGADAAN_LIST])
  );

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

  const removePengadaan = (id) => {
    setSearchQuery('');
    setPengadaanList(
      pengadaanList.filter((pengadaan) => pengadaan.id_pengadaan !== id)
    );
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = pengadaanList.filter(
      (item) =>
        item.nama_pengadaan
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase()) ||
        item.instansi_pengadaan
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase()) ||
        item.tanggal_pengadaan
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase())
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    if (!searchQuery) {
      setFilteredData(pengadaanList);
    }
  }, [pengadaanList]);

  const handlePress = (id_pengadaan) => {
    setSearchQuery('');
    router.push(`/pengadaan/${id_pengadaan}`);
  };

  return (
    <Container style={styles.contentContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <Link href="/form-pengadaan" asChild>
          <Button icon="plus" mode="contained" style={styles.button}>
            <Text style={styles.buttonText}>Tambah Pengadaan</Text>
          </Button>
        </Link>
        <Searchbar
          placeholder="Search"
          onChangeText={handleSearch}
          value={searchQuery}
          style={{ flex: 1 }}
        />
      </View>
      <FlatList
        data={searchQuery ? filteredData : pengadaanList}
        keyExtractor={(item) => item.id_pengadaan.toString()}
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
            <View style={{ flex: 1, flexDirection: 'row', width: '100%' }}>
              <View style={styles.row}>
                <View style={styles.dataMenuRow}>
                  <View style={{ padding: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dataItemText}>Nama</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={styles.dataItemText}>: </Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.dataItemText}>
                        {item.nama_pengadaan.substring(0, 13)}{' '}
                      </Text>
                    </View>
                  </View>
                  <View style={{ padding: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dataItemText}>Instansi</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={styles.dataItemText}>: </Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.dataItemText}>
                        {item.instansi_pengadaan.substring(0, 13)}{' '}
                      </Text>
                    </View>
                  </View>
                  <View style={{ padding: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dataItemText}>Tanggal</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={styles.dataItemText}>: </Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.dataItemText}>
                        {item.tanggal_pengadaan.substring(0, 13)}{' '}
                      </Text>
                    </View>
                  </View>
                  <View style={{ padding: 1, flexDirection: 'row' }}></View>

                  <Divider />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    }}
                  >
                    <Button
                      mode="text"
                      onPress={() =>
                        router.push({
                          pathname: '/barang-pengadaan',
                          params: { pengadaan: item.id_pengadaan },
                        })
                      }
                      contentContainerStyle={modalStyle}
                      style={{ marginHorizontal: 'auto' }}
                    >
                      Kelola Data
                    </Button>
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
                </View>

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Pressable
                    onPress={() => removePengadaan(item.id_pengadaan)}
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
                    onPress={() => handlePress(item.id_pengadaan)}
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
                    <Dialog
                      visible={visibleDetail}
                      onDismiss={() => hideDialogDetail(item)}
                    >
                      <Dialog.Title>Detail Pengadaan</Dialog.Title>
                      <Dialog.Content>
                        <View style={{ padding: 1, flexDirection: 'row' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.dataItemText}>
                              Nama Pengadaan
                            </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={styles.dataItemText}>: </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.dataItemText}>
                              {dataDetail.nama_pengadaan}{' '}
                            </Text>
                          </View>
                        </View>
                        <View style={{ padding: 1, flexDirection: 'row' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.dataItemText}>
                              Instansi Pengadaan
                            </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={styles.dataItemText}>: </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.dataItemText}>
                              {dataDetail.instansi_pengadaan}{' '}
                            </Text>
                          </View>
                        </View>
                        <View style={{ padding: 1, flexDirection: 'row' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.dataItemText}>
                              Tanggal Pengadaan
                            </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={styles.dataItemText}>: </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.dataItemText}>
                              {dataDetail.tanggal_pengadaan}{' '}
                            </Text>
                          </View>
                        </View>
                      </Dialog.Content>
                      <Dialog.Actions>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            width: '100%',
                          }}
                        >
                          <Button onPress={() => hideDialogDetail(item)}>
                            Done
                          </Button>
                        </View>
                      </Dialog.Actions>
                    </Dialog>
                  </Portal>
                </View>
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
