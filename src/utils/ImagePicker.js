import * as ImagePicker from 'expo-image-picker';

const PickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
    });

    if (!result.canceled) {
        console.log(result.assets[0].uri);
    }else{
        console.log('cancelado');
        console.log(result.assets[0].uri);

    }
};

export default PickImage;
