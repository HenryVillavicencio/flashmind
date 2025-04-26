import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={{ borderWidth: 5, borderColor: "black", padding: 20 }} >
      <Text style={{ borderWidth: 5, borderColor: "yellow", padding: 10, margin: 10 }}>Home Screen</Text>
      <Text style={{ borderWidth: 5, borderColor: "blue", padding: 10 }}>Hola mundo</Text>
    </View>
  );
}

