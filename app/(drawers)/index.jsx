import { Colors } from '@/constants/Colors';
import { StatusBar } from 'expo-status-bar';
import {
  Appearance,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { id, registerTranslation } from 'react-native-paper-dates';

import CVUJS from '@/assets/images/adaptive-icon.png';
registerTranslation('id', id);

if (__DEV__) {
  require('./ReactotronConfig');
}

const app = () => {
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(theme, colorScheme);

  return (
    <View style={styles.container}>
      <View style={styles.watermarkContainer}>
        <ImageBackground
          source={CVUJS}
          resizeMode="contain"
          style={styles.watermark}
          opacity={0.3}
        />
      </View>
      <Text style={styles.title}>
        Selamat Datang Di {'\n'} Aplikasi Pengadaan Barang {'\n'}CV. UJS
      </Text>

      {/* </ImageBackground> */}
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </View>
  );
};

export default app;

function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      akignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
    },
    image: {
      width: '100%',
      height: '100%',
      flex: 1,
      resizeMode: 'center',
      justifyContent: 'center',
    },
    watermarkContainer: {
      position: 'absolute',
      top: '30%', // adjust as needed
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 0,
    },
    watermark: {
      width: 320, // adjust size as needed
      height: 320,
    },
    title: {
      color: 'white',
      fontSize: 41,
      fontWeight: 'bold',
      textAlign: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      marginBottom: 120,
    },
  });
}
