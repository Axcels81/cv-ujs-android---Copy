import { Colors } from '@/constants/Colors';
import { PERBANDINGAN_HARGA_LIST } from '@/data/PerbandinganHarga';
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

export default function MenuPerbandinganHarga() {
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const styles = createStyles(theme, colorScheme);

  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;
  const [perbandinganHargaList, setPerbandinganHargaList] = useState([]);
  const [pengadaanData, setPengadaanData] = useState([]);
  const [barangPengadaanData, setBarangPengadaanData] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [barangSupplierData, setBarangSupplierData] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [visibleDetail, setVisibleDetail] = useState(false);

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
    <Text style={{ color: theme.text }}>Data Perbandingan Harga Terakhir</Text>
  );

  const emptyComponent = (
    <Text style={{ color: theme.text }}>
      Data Perbandingan Harga Tidak Ditemukan!
    </Text>
  );

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('PerbandinganHargaList');
          const storagePerbandinganHarga =
            jsonValue != null ? JSON.parse(jsonValue) : null;
          if (storagePerbandinganHarga && storagePerbandinganHarga.length) {
            setPerbandinganHargaList(
              storagePerbandinganHarga.sort(
                (a, b) => b.id_perbandingan_harga - a.id_perbandingan_harga
              )
            );
          } else {
            setPerbandinganHargaList(
              PERBANDINGAN_HARGA_LIST.sort(
                (a, b) => b.id_perbandingan_harga - a.id_perbandingan_harga
              )
            );
          }
          // setPerbandinganHargaList(storagePerbandinganHarga.sort((a,b) => b.id_perbandingan_harga - a.id_perbandingan_harga))
        } catch (e) {
          console.error(e);
        }
      };
      fetchData();
    }, [PERBANDINGAN_HARGA_LIST])
  );

  useEffect(() => {
    const storageData = async () => {
      try {
        const jsonValue = JSON.stringify(perbandinganHargaList);
        await AsyncStorage.setItem('PerbandinganHargaList', jsonValue);
      } catch (e) {
        console.error(e);
      }
    };

    storageData();
  }, [perbandinganHargaList]);

  const removePerbandinganHarga = (id) => {
    setPerbandinganHargaList(
      perbandinganHargaList.filter(
        (perbandinganHarga) => perbandinganHarga.id_perbandingan_harga !== id
      )
    );
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = perbandinganHargaList.filter(
      (item) =>
        item.nama_perbandingan_harga
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase()) ||
        getNamaPengadaan(item.id_pengadaan)
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase()) ||
        getNamaSupplier(item.id_supplier)
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase()) ||
        getNamaBarang(item.id_barang_supplier)
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase()) ||
        item.harga_perbandingan_harga
          .toString()
          .toLowerCase()
          .includes(text.toString().toLowerCase()) ||
        (item.spesifikasi &&
          item.spesifikasi
            .toString()
            .toLowerCase()
            .includes(text.toString().toLowerCase()))
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    if (!searchQuery) {
      setFilteredData(perbandinganHargaList);
    }
  }, [perbandinganHargaList]);

  const handlePress = (id_perbandingan_harga) => {
    setSearchQuery('');

    router.push(`/perbandingan_harga/${id_perbandingan_harga}`);
  };

  useFocusEffect(
    useCallback(() => {
      const fetchAllData = async () => {
        try {
          const jsonValuePengadaan = await AsyncStorage.getItem(
            'PengadaanList'
          );
          const dataPengadaan =
            jsonValuePengadaan != null ? JSON.parse(jsonValuePengadaan) : [];
          const jsonValueBarangPengadaan = await AsyncStorage.getItem(
            'ProcApp'
          );
          const dataBarangPengadaan =
            jsonValueBarangPengadaan != null
              ? JSON.parse(jsonValueBarangPengadaan)
              : [];
          const jsonValueSupplier = await AsyncStorage.getItem('SupplierList');
          const dataSupplier =
            jsonValueSupplier != null ? JSON.parse(jsonValueSupplier) : [];
          const jsonValueBarangSupplier = await AsyncStorage.getItem(
            'BarangSupplierList'
          );
          const dataBarangSupplier =
            jsonValueBarangSupplier != null
              ? JSON.parse(jsonValueBarangSupplier)
              : [];
          setPengadaanData(dataPengadaan);
          setBarangPengadaanData(dataBarangPengadaan);
          setSupplierData(dataSupplier);
          setBarangSupplierData(dataBarangSupplier);
        } catch (error) {
          console.error(error);
        }
      };
      fetchAllData();
    }, [])
  );

  // Helper to get nama_pengadaan from id_pengadaan
  const getNamaPengadaan = (id_pengadaan) => {
    const parsedIdPengadaan = Number(id_pengadaan); // ensure it's a number
    const found = pengadaanData.find(
      (p) => Number(p.id_pengadaan) === parsedIdPengadaan
    );
    return found ? found.nama_pengadaan : '-';
  };
  const getNamaSupplier = (id_supplier) => {
    const parsedIdSupplier = Number(id_supplier); // ensure it's a number
    const found = supplierData.find(
      (p) => Number(p.id_supplier) === parsedIdSupplier
    );
    return found ? found.nama_supplier : '-';
  };
  const getNamaBarangPengadaan = (id) => {
    const parsedIdBarang = Number(id); // ensure it's a number
    const found = barangPengadaanData.find(
      (p) => Number(p.id) === parsedIdBarang
    );
    return found ? found.nama : '-';
  };
  const getNamaBarang = (id_barang_supplier) => {
    const parsedIdBarangSupplier = Number(id_barang_supplier); // ensure it's a number
    const found = barangSupplierData.find(
      (p) => Number(p.id_barang_supplier) === parsedIdBarangSupplier
    );
    return found ? found.nama : '-';
  };

  return (
    <Container style={styles.contentContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <Link href="/form-perbandingan-harga" asChild>
          <Button icon="plus" mode="contained" style={styles.button}>
            <Text style={styles.buttonText}>Tambah Transaksi</Text>
          </Button>
        </Link>
        {/* <Link href="/test" asChild>
          <Button icon="plus" mode="contained" style={styles.button}>
            <Text style={styles.buttonText}>Purchase Order</Text>
          </Button>
        </Link> */}
        <Searchbar
          placeholder="Search"
          onChangeText={handleSearch}
          value={searchQuery}
          style={{ flex: 1 }}
        />
      </View>
      <FlatList
        data={searchQuery ? filteredData : perbandinganHargaList}
        keyExtractor={(item) => item.id_perbandingan_harga.toString()}
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
                      <Text style={styles.dataItemText}>Nama Transaksi</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={styles.dataItemText}>: </Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.dataItemText}>
                        {item.nama_perbandingan_harga.substring(0, 13)}{' '}
                      </Text>
                    </View>
                  </View>
                  <View style={{ padding: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dataItemText}>Barang</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={styles.dataItemText}>: </Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.dataItemText}>
                        {getNamaBarang(item.id_barang_supplier).substring(
                          0,
                          13
                        )}{' '}
                      </Text>
                    </View>
                  </View>
                  <View style={{ padding: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dataItemText}>Harga Barang</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={styles.dataItemText}>: </Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.dataItemText}>
                        {'Rp. '}
                        {item.harga_perbandingan_harga}{' '}
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
                    onPress={() =>
                      removePerbandinganHarga(item.id_perbandingan_harga)
                    }
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
                    onPress={() => handlePress(item.id_perbandingan_harga)}
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
                      <Dialog.Title>Detail Transaksi</Dialog.Title>
                      <Dialog.Content>
                        <View style={{ padding: 1, flexDirection: 'row' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.dataItemText}>
                              Nama Transaksi
                            </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={styles.dataItemText}>: </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.dataItemText}>
                              {dataDetail.nama_perbandingan_harga}{' '}
                            </Text>
                          </View>
                        </View>
                        <View style={{ padding: 1, flexDirection: 'row' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.dataItemText}>Pengadaan</Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={styles.dataItemText}>: </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.dataItemText}>
                              {getNamaPengadaan(dataDetail.id_pengadaan)}{' '}
                            </Text>
                          </View>
                        </View>
                        <View style={{ padding: 1, flexDirection: 'row' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.dataItemText}>Supplier</Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={styles.dataItemText}>: </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.dataItemText}>
                              {getNamaSupplier(dataDetail.id_supplier)}{' '}
                            </Text>
                          </View>
                        </View>
                        <View style={{ padding: 1, flexDirection: 'row' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.dataItemText}>Barang</Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={styles.dataItemText}>: </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.dataItemText}>
                              {getNamaBarang(dataDetail.id_barang_supplier)}{' '}
                              {/* {getNamaBarangPengadaan(dataDetail.id)}{' '} */}
                            </Text>
                          </View>
                        </View>
                        <View style={{ padding: 1, flexDirection: 'row' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.dataItemText}>
                              Harga Barang
                            </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={styles.dataItemText}>: </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.dataItemText}>
                              {dataDetail.harga_perbandingan_harga}{' '}
                            </Text>
                          </View>
                        </View>
                        <View style={{ padding: 1, flexDirection: 'row' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.dataItemText}>Spesifikasi</Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={styles.dataItemText}>: </Text>
                          </View>
                          <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.dataItemText}>
                              {dataDetail.spesifikasi || '-'}
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
