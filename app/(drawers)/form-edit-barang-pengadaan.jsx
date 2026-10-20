import { StyleSheet, Appearance, Platform, ScrollView, FlatList, Text, View, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BARANG_ITEM } from "@/data/BarangPengadaan"
import { Link } from "expo-router";

import { Colors } from "@/constants/Colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MenuFormBarangPengadaan(){
    const colorScheme = Appearance.getColorScheme()
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const styles = createStyles(theme, colorScheme)

    const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;

    const [proc, setProc] = useState([])
    const [nama, setNama] = useState('')
    const [kode, setKode] = useState('')
    const [jenis, setJenis] = useState('')
    const [jumlah, setJumlah] = useState('')
    const [tempID, setTempID] = useState('')

    useEffect(() => {
      const fetchData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem("ProcApp")
            const storageProc = jsonValue != null ? JSON.parse(jsonValue): null

            if (storageProc && storageProc.length) {
                setProc(storageProc.sort((a,b) => b.id - a.id))
            } else {
                setProc(BARANG_ITEM.sort((a,b) => b.id - a.id))
            }
        } catch(e){
            console.error(e)
        }
      }
      fetchData()
    }, [BARANG_ITEM])

    useEffect(() => {
      const storageData = async () => {
        try {
            const jsonValue = JSON.stringify(proc)
            await AsyncStorage.setItem("ProcApp", jsonValue)
        } catch (e) {
            console.error(e)
        }
      }

      storageData()
    }, [proc])

    getID = async () => {
        try {
            const tempID = await AsyncStorage.getItem("@tempID")
            if (tempID !== null){
                setTempID(tempID)
            }
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
      getID()
    }, [])
    
    
    const updateProc = (setTempID) => {
        setProc(proc.map(procs=>
            procs.id === setTempID ? {...procs, nama: nama, kode: kode, jenis: jenis, jumlah: jumlah} : procs
        ))
        setNama('')
        setKode('')
        setJenis('')
        setJumlah('')
    }


    return (
        <SafeAreaView style={styles.container}>
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
                    {/* <Link href="/barang-pengadaan" style={{ marginHorizontal: 'auto'}} asChild> */}
                        <Pressable onPress={() => updateProc(setTempID)} style={styles.addButton}>
                            <Text style={styles.addButtonText}>Simpan</Text>
                        </Pressable>
                    {/* </Link> */}
                </View>
            </View>

        </SafeAreaView>
    );
}

function createStyles (theme, colorScheme) {
    return StyleSheet.create ({
        container: {
            flex: 1,
            flexDirection: 'column',
            width: '100%',
            backgroundColor: theme.background,
        },
        titleName: {
            fontsize: 42,
            fontWeight: 'bold',
            color: theme.text,
        },
        inputContainer:{
            alignItems: 'center',
            marginBottom: 10,
            padding: 10,
            width: '100%',
            maxWidth: 1024,
            marginHorizontal: 'auto',
            pointerEvents: 'auto',
            borderRadius: 15,
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
            color: theme.text
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
        }

    })
}