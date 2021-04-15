import { Button, Container, Form, H1, Input, Item, Text, Toast } from 'native-base'
import { View } from 'react-native'
import React, { useState } from 'react'
import globalStyles from '../styles/global'
import { useNavigation } from '@react-navigation/native'
import { gql, useMutation } from '@apollo/client'
import AsyncStorage from '@react-native-community/async-storage'

const AUTENTICAR_USUARIO = gql`
    mutation autenticarUsuario($input: AutenticarInput){
        autenticarUsuario(input: $input){
            token
        }
    }
`

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [mensaje, setMensaje] = useState(null)
    const [autenticarUsuario] = useMutation(AUTENTICAR_USUARIO)
    const navigation = useNavigation()
    const handleSubmit = async () => {
        if (email === '' || password === '') {
            setMensaje('Todos los campos son obligatorios')
            return
        }
        if (password.length < 6) {
            setMensaje('El password debe tener al menos 6 caracteres')
            return
        }
        try {
            const { data } = await autenticarUsuario({
                variables: {
                    input: {
                        email,
                        password
                    }
                }
            })
            const { token } = data.autenticarUsuario
            await AsyncStorage.setItem('token', token)
            navigation.navigate('Proyectos')
        } catch (error) {
            setMensaje(error.message.replace('GraphQL error: ', ''))
        }
    }
    const mostrarAlerta = () => {
        Toast.show({
            text: mensaje,
            buttonText: 'OK',
            duration: 5000
        })
    }
    return (
        <>
            <Container style={[globalStyles.contenedor], { backgroundColor: '#e84347' }}>
                <View style={globalStyles.contenido}>
                    <H1 style={globalStyles.titulo}>UpTask</H1>
                    <Form>
                        <Item inlineLabel last style={globalStyles.input}>
                            <Input
                                onChangeText={texto => setEmail(texto.toLowerCase())}
                                value={email}
                                placeholder='Email'
                            />
                        </Item>
                        <Item inlineLabel last style={globalStyles.input}>
                            <Input
                                secureTextEntry={true}
                                onChangeText={texto => setPassword(texto)}
                                placeholder='Password'
                            />
                        </Item>
                    </Form>
                    <Button square block style={globalStyles.boton} onPress={() => handleSubmit()}>
                        <Text style={globalStyles.botonTexto}>
                            Iniciar Sesion
                        </Text>
                    </Button>
                    <Text onPress={() => navigation.navigate('CrearCuenta')} style={globalStyles.enlace}>Crear Cuenta</Text>
                    {mensaje && mostrarAlerta()}
                </View>
            </Container>
        </>
    )
}

export default Login
