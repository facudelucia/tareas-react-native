import { Button, Container, Form, H1, Input, Item, Text, Toast } from 'native-base'
import React, { useState } from 'react'
import globalStyles from '../styles/global'
import { useNavigation } from '@react-navigation/native'
import { View } from 'react-native'
import { gql, useMutation } from '@apollo/client'

const NUEVO_PROYECTO = gql`
    mutation nuevoProyecto($input: ProyectoInput){
        nuevoProyecto(input: $input){
            nombre
            id
        }
    }
`
const OBTENER_PROYECTOS = gql`
    query obtenerProyectos{
        obtenerProyectos{
            id
            nombre
        }
    }
`
const NuevoProyecto = () => {
    const [nombre, setNombre] = useState('')
    const [mensaje, setMensaje] = useState(null)
    const [nuevoProyecto] = useMutation(NUEVO_PROYECTO, {
        update(cache, { data: { nuevoProyecto } }) {
            const { obtenerProyectos } = cache.readQuery({ query: OBTENER_PROYECTOS })
            cache.writeQuery({
                query: OBTENER_PROYECTOS,
                data: { obtenerProyectos: obtenerProyectos.concat([nuevoProyecto]) }
            })
        }
    })
    const navigation = useNavigation()
    const mostrarAlerta = () => {
        Toast.show({
            text: mensaje,
            buttonText: 'OK',
            duration: 5000
        })
    }
    const handleSubmit = async () => {
        if (nombre === '') {
            setMensaje('Todos los campos son obligatorios')
            return
        }

        try {
            const { data } = await nuevoProyecto({
                variables: {
                    input: {
                        nombre
                    }
                }
            })
            setMensaje('Proyecto creado correctamente')
            navigation.navigate('Proyectos')
        } catch (error) {
            setMensaje(error.message.replace('GraphQL error: ', ''))
        }
    }
    return (
        <Container style={[globalStyles.contenedor], { backgroundColor: '#e84347' }}>
            <View style={globalStyles.contenido}>
                <H1 style={globalStyles.subtitulo}>Selecciona un proyecto</H1>
                <Form>
                    <Item>
                        <Input
                            inlineLabel last style={globalStyles.input}
                            placeholder='Nombre del proyecto'
                            onChangeText={texto => setNombre(texto)}
                        />
                    </Item>
                </Form>
                <Button
                    style={[globalStyles.boton, { marginTop: 30 }]}
                    square
                    block
                    onPress={()=>handleSubmit()}
                >
                    <Text style={globalStyles.botonTexto}>
                        Crear proyecto
                    </Text>
                </Button>
                {mensaje && mostrarAlerta()}
            </View>
        </Container>
    )
}

export default NuevoProyecto
