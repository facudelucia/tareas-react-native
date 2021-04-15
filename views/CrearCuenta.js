import { Button, Container, Form, H1, Input, Item, Text, Toast } from 'native-base'
import { View } from 'react-native'
import React, { useState } from 'react'
import globalStyles from '../styles/global'
import { useNavigation } from '@react-navigation/native'
import { gql, useMutation } from '@apollo/client'

const NUEVA_CUENTA = gql`
    mutation crearUsuario($input: UsuarioInput){
        crearUsuario(input: $input)
    }
`
const CrearCuenta = () => {
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [mensaje, setMensaje] = useState(null)

    const [crearUsuario] = useMutation(NUEVA_CUENTA)

    const handleSubmit = async () => {
        if (nombre === '' || email === '' || password === '') {
            setMensaje('Todos los campos son obligatorios')
            return
        }
        if (password.length < 6) {
            setMensaje('El password debe tener al menos 6 caracteres')
            return
        }
        try {
            const { data } = await crearUsuario({
                variables: {
                    input: {
                        nombre,
                        email,
                        password
                    }
                }
            })
            setMensaje(data.crearUsuario)
            navigation.navigate('Login')
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
    const navigation = useNavigation()
    return (
        <>
            <Container style={[globalStyles.contenedor], { backgroundColor: '#e84347' }}>
                <View style={globalStyles.contenido}>
                    <H1 style={globalStyles.titulo}>UpTask</H1>
                    <Form>
                        <Item inlineLabel last style={globalStyles.input}>
                            <Input
                                onChangeText={texto => setNombre(texto)}
                                placeholder='Nombre'
                            />
                        </Item>
                        <Item inlineLabel last style={globalStyles.input}>
                            <Input
                                placeholder='Email'
                                onChangeText={texto => setEmail(texto)}
                            />
                        </Item>
                        <Item inlineLabel last style={globalStyles.input}>
                            <Input
                                secureTextEntry={true}
                                placeholder='Password'
                                onChangeText={texto => setPassword(texto)}
                            />
                        </Item>
                    </Form>
                    <Button square block style={globalStyles.boton}
                        onPress={() => handleSubmit()}
                    >
                        <Text style={globalStyles.botonTexto}>
                            Crear Cuenta
                        </Text>
                    </Button>
                    {mensaje && mostrarAlerta()}
                </View>
            </Container>
        </>
    )
}

export default CrearCuenta

