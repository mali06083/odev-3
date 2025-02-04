import { View, TextInput, Button, Image, Alert, Share, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useRef } from "react";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { StyleSheet } from "react-native";
import { MaskedTextInput } from "react-native-mask-text";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import CBottomSheet from "@/components/bottom-sheet";
import MapView, { Marker } from 'react-native-maps';
import React from 'react';

export default function HomeScreen() {
  const bottomSheetRef = useRef(null);
  const {
    control,
    setValue,
    handleSubmit,
  } = useForm({    defaultValues: {
      email: '',
      password: '',
      phone_number:''
    }
  });

const getEmailFromStorage = async () => {
  const email = await AsyncStorage.getItem("form-email");
  if(!email){return""};
  return email
}
 useEffect(() => {
    getEmailFromStorage().then(res => {
      setValue('email', res);
    });
  }, []);
  const isDefaultLocation = (location: any) => {
    return Math.abs(location.latitude - 41.0082) < 0.0001 && 
           Math.abs(location.longitude - 28.9784) < 0.0001;
  };
  
  
  const onSubmit = (data: any) => {
    console.log('Submit sırasında region:', region);
  
  
    if (!data.email || !data.password || !data.phone_number) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (!imageSource) {
      Alert.alert('Hata', 'Lütfen bir resim seçin');
      return;
    }

   
    if (!region ) { 
      Alert.alert('Hata', 'Lütfen konum seçin');
      return;
    }

    
    Alert.alert('Başarılı', 'Kullanıcı oluşturuldu');
    console.log('Form data:', data);
    console.log('Image:', imageSource);
    console.log('Location:', region);
  };

const[imageSource,setImageSource] = useState<string | null >(null)

const [region, setRegion] = useState("");

  const downloadImage = async (imageUrl: string) => {
    try {
      // İzinleri kontrol et
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Resmi kaydetmek için izin gerekiyor');
        return;
      }

      // Resmi indirme işlemi
      const filename = imageUrl.split('/').pop() || 'downloaded_image.jpg';
      const result = await FileSystem.downloadAsync(
        imageUrl,
        FileSystem.documentDirectory + filename
      );

      if (result.status !== 200) {
        Alert.alert('Hata', 'Resim indirilemedi');
        return;
      }

      // Resmi galeriye kaydet
      const asset = await MediaLibrary.createAssetAsync(result.uri);
      await MediaLibrary.createAlbumAsync('Downloads', asset, false);

      Alert.alert('Başarılı', 'Resim galeriye kaydedildi');

      // Paylaşma seçeneği sun
      const shareImage = async () => {
        try {
          await Share.share({
            url: result.uri,
            message: 'İndirilen resim'
          });
        } catch (error) {
          console.error(error);
        }
      };

      Alert.alert(
        'Resim İndirildi',
        'Resmi paylaşmak ister misiniz?',
        [
          {
            text: 'Hayır',
            style: 'cancel'
          },
          {
            text: 'Paylaş',
            onPress: shareImage
          }
        ]
      );

    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Resim indirilirken bir hata oluştu');
    }
  };

  const handleImageSelection = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImageSource(result.assets[0].uri);
        // Resmi indirme seçeneği sun
        Alert.alert(
          'Resim Seçildi',
          'Bu resmi indirmek ister misiniz?',
          [
            {
              text: 'Hayır',
              style: 'cancel'
            },
            {
              text: 'İndir',
              onPress: () => downloadImage(result.assets[0].uri)
            }
          ]
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Resim seçilirken bir hata oluştu');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="p-2 mt-4 gap-y-3 flex-1">
     
        
        <Controller
          name="email"
          control={control}
          render={({ field: { onChange,onBlur, value } }) => (
            <TextInput 
              value={value}
              onChangeText={onChange}
              onBlur={async (e) => {
                await AsyncStorage.setItem("form-email", e.nativeEvent.text);
              }}
              placeholder="Email"
              className="w-full bg-slate-300 rounded-md p-3"
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextInput 
              value={value}
              onChangeText={onChange}
              placeholder="Password"
              className="w-full bg-slate-300 rounded-md p-3"
              secureTextEntry={true}
            />
          )}
        />
            <Controller
          name="phone_number"
          control={control}
          render={({ field: { onChange, value } }) => (
            <MaskedTextInput 
            mask=" (999) 999-9999"
              value={value}
              onChangeText={(formatted, extracted) => onChange(formatted,extracted)}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              secureTextEntry={false}
              style={{
                width: "100%",
                backgroundColor: "#cbd5e1",
                borderRadius: 8,
                padding: 9
              }}
            />
          )}
        />
        <Button onPress={handleSubmit(onSubmit)} title="LOG IN" />
        <Controller
          control={control}
          name="image"
          render={({ field: { onChange, value } }) => (
            <>
              <Button title="Select Image" onPress={handleImageSelection} />
              {imageSource && (
                <View style={{ alignItems: 'center' }}>
                  <Image
                    source={{ uri: imageSource }}
                    style={{ width: 200, height: 200, marginVertical: 10 }}
                  />
                  <Button 
                    title="download image" 
                    onPress={() => downloadImage(imageSource)}
                  />
                  
                </View>
              )}
            </>
          )}
        />
        <CBottomSheet 
          ref={bottomSheetRef} 
        
        />
        <Button 
          title="Select Location" 
          onPress={() => bottomSheetRef.current?.open()} 
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
