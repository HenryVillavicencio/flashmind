import DeckCard from "@/components/DeckCard";
import { View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      
      <DeckCard name={"Fundamento de Typescript"} description={"Aprende los conceptos de typescript desde 0"}
      />
      <DeckCard name={"Fundamento de Typescript"} description={"Aprende los conceptos de typescript desde 0"}
      />
    </View>
  );
}
