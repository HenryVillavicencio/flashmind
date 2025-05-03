import { View, Text, Image, StyleSheet } from 'react-native';
import React from 'react';

interface DeckCardProps {
  name: string;
  description: string;
  imageUrl?: string;
  color?: string; // Fallback color if no image
}

const DeckCard: React.FC<DeckCardProps> = ({ name, description, imageUrl, color }) => {
  return (
    <View style={styles.cardContainer}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
      ) : <View style={[styles.cardImage, { backgroundColor: "#DEDEDE" }]} />}
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '90%', // Adjust as needed
    height: 150, // Adjust as needed
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImage: {
    width: 150, // Adjust as needed
    height: '100%',
    resizeMode: 'cover',
  },
  textContainer: {
    padding: 10,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#555',
  },
});

export default DeckCard;