import { useEffect, useState } from 'react';
import { View, Text, StatusBar, SafeAreaView, StyleSheet, TextInput, Button, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import MapView, { PROVIDER_GOOGLE, enableLatestRenderer, LatLng, Marker } from 'react-native-maps';

enableLatestRenderer();

function App() {


  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");

  var lista: LatLng[] = [];
  const [markers, setMarkers] = useState(lista);

  // handler para cambio de estado de usuario
  function onAuthStateChanged(user: any){
    setUser(user);
    if(initializing) setInitializing(false);
    console.log("usuario cambiado: " + user);
  }

  useEffect(() => {

    const funcionLimpieza = auth().onAuthStateChanged(onAuthStateChanged);

    // algo chistoso
    // en los efectos podemos regresar una función que se va a invocar para limpieza
    return funcionLimpieza;
  }, []);

  useEffect(() => {

    const funcionLimpieza = firestore()
    .collection('Perritos')
    .onSnapshot(perritos => {
      console.log("****************** CAMBIO DETECTADO ***********************");
      perritos.docs.forEach(actual => {
        
        console.log("nombre: " + actual.data().nombre + " edad: " + actual.data().edad);
      });
    });

    return funcionLimpieza;
  }, []);

  if(initializing) return (<View><ActivityIndicator /></View>);

  return (
    <View>
      <StatusBar />
      <SafeAreaView>
        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 20}}>HOLA A TODOS</Text>
        </View>

        <View style={styles.contenedor}>
          <Text style={styles.texto1}>UN TEXTO</Text>
          <Text style={styles.texto2}>OTRO TEXTO</Text>
          <Text style={styles.texto3}>TERCER TEXTO</Text>
        </View>
        <TextInput 
          placeholder='login'
          onChangeText={text => {
            setUsuario(text);
          }}
        />
        <TextInput 
          placeholder='password'
          secureTextEntry={true}
          onChangeText={text => {
            setPassword(text);
          }}
        />
        <View style={styles.botoncito}>
          <Button 
            title="REGISTRAR USUARIO"
            onPress={() => {
              auth()
              .createUserWithEmailAndPassword(usuario, password)
              .then(() => {
                console.log("USUARIO: " + usuario + " REGISTRADO EXITOSAMENTE");
              })
              .catch(error => {

                console.log(error);
                console.log(error.code);
              });
            }}
          />
        </View>
        <View style={styles.botoncito}>
          <Button 
            title="LOGIN"
            onPress={() => {
              auth()
              .signInWithEmailAndPassword(usuario, password)
              .then(() => {
                console.log("USUARIO: " + usuario + " ENTRÓ EXITOSAMENTE");
              }).catch(error => {
                console.log(error);
              });
            }}
          />
        </View>
        <View style={styles.botoncito}>
          <Button 
            title="LOGOUT"
            onPress={() => {

              auth()
              .signOut()
              .then(() => {
                console.log("USUARIO SALIÓ EXITOSAMENTE");
              });
            }}
          />
        </View>
        <TextInput 
          placeholder='nombre'
          onChangeText={text => {
            setNombre(text);
          }}
        />
        <TextInput 
          placeholder='edad'
          onChangeText={text => {
            setEdad(text);
          }}
        />
        <Button 
        title='registrar perrito'
        onPress={() => {

          firestore()
          .collection('Perritos')
          .add({nombre: nombre, edad: edad})
          .then(() => {
            console.log("PERRITO REGISTRADO CON GRAN ÉXITO");
          });
        }}
        />
        <Button 
        title='hacer query a perritos'
        onPress={() => {

          firestore()
          .collection('Perritos')
          .get()
          .then(perritos => {

            // recibo un snapshot 
            console.log(perritos);
            perritos.docs.forEach(actual => {
              console.log("nombre: " + actual.data().nombre + " edad: " + actual.data().edad);
            });
          });
        }}
        />
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={{
              latitude: 20.737121,
              longitude: -103.454228,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }}
            onPress={event => {
              console.log(event.nativeEvent.coordinate);
              setMarkers(markers.concat(event.nativeEvent.coordinate));
            }}
          >
          {
            // shortcircuit
            // si el primero no pasa el segundo no se ejecuta
            markers.length > 0 && markers.map((actual, i) => (<Marker coordinate={actual} key={i} />))
          }
          </MapView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row'
  },

  texto1: {

    flex: 3,
    backgroundColor: 'orange'
  },

  texto2: {

    flex: 2,
    backgroundColor: '#0000cc',
    color: 'white',
    fontWeight: 'bold',
    width: '20%'
  },

  texto3: {

    flex: 1,
    backgroundColor: '#ffaaaa',
    width: '20%'
  },

  botoncito: {
    padding: 2
  },

  mapContainer: {
    height: "100%",
    width: "100%",
  },

  map: {
    height: "100%",
    width: "100%",
  }
});
export default App;
