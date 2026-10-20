import { router } from 'expo-router';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  Dialog,
  Icon,
  PaperProvider,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';

import { useSession } from './stores/ctx';

export default function SignIn() {
  const { signIn } = useSession();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [visibleLogin, setVisibleLogin] = React.useState(false);
  const showDialog = () => setVisibleLogin(true);
  const hideDialog = () => setVisibleLogin(false);

  const handleLogin = async () => {
    const success = await signIn(username, password);
    if (success) {
      router.replace('/'); // Navigate to home
    } else {
      showDialog(); // Show error dialog
    }
    // try {
    //   signIn(username, password);
    //   router.replace('/');
    // } catch (error) {
    //   showDialog();
    // }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Icon source={require('../assets/images/logo-cvujs.png')} size={200} />
        <Text style={styles.title} variant="displaySmall">
          Login Sistem {'\n'}Pengadaan Barang
        </Text>
        <View style={styles.inputContainerText}>
          <TextInput
            mode="outlined"
            label="Username"
            placeholder="Masukkan Username"
            value={username}
            onChangeText={(username) => setUsername(username)}
          />
          <TextInput
            mode="outlined"
            label="Password"
            placeholder="Masukkan Password"
            value={password}
            secureTextEntry
            onChangeText={(password) => setPassword(password)}
          />
          <Button
            mode="contained"
            buttonColor="white"
            textColor="black"
            onPress={handleLogin}
          >
            Login
          </Button>
          <Text variant="bodySmall" style={{ textAlign: 'center' }}>
            © CV. UJS. All rights reserved.
          </Text>
          {/* <Text
          onPress={() => {
            signIn();
            // Navigate after signing in. You may want to tweak this to ensure sign-in is
            // successful before navigating.
            router.replace('/');
          }}
        >
          Sign In
        </Text> */}
        </View>

        <Portal>
          <Dialog visible={visibleLogin} onDismiss={hideDialog}>
            <Dialog.Icon icon="alert" />
            <Dialog.Title style={styles.title}>Terjadi Kesalahan</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">
                Login gagal, silakan periksa username dan password Anda atau
                hubungi Admin.
              </Text>
            </Dialog.Content>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#212936',
  },
  inputContainerText: {
    marginBottom: 10,
    padding: 10,
    gap: 6,
    width: '100%',
    marginHorizontal: 'auto',
    pointerEvents: 'auto',
  },
  title: {
    textAlign: 'center',
  },
});
