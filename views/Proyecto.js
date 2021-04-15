import { Button, Container, Content, Form, H2, Input, Item, List, Text, Toast } from 'native-base'
import React, { useState } from 'react'
import globalStyles from '../styles/global'
import { gql, useMutation, useQuery } from '@apollo/client'
import { StyleSheet } from 'react-native'
import Tarea from '../components/Tarea'
const NUEVA_TAREA = gql`
    mutation nuevaTarea($input:TareaInput){
        nuevaTarea(input: $input){
            nombre
            id
            proyecto
            estado
        }
    }
`
const OBTENER_TAREAS = gql`
    query obtenerTareas($input: ProyectoIDInput){
        obtenerTareas(input: $input){
            id
            nombre
            estado
        }
    }
`
const Proyecto = ({ route }) => {
    const [nombre, setNombre] = useState('')
    const [mensaje, setMensaje] = useState(null)
    const [nuevaTarea] = useMutation(NUEVA_TAREA, {
        update(cache, { data: { nuevaTarea } }) {
            const { obtenerTareas } = cache.readQuery({
                query: OBTENER_TAREAS,
                variables: {
                    input: {
                        proyecto: route.params.id
                    }
                }
            })
            cache.writeQuery({
                query: OBTENER_TAREAS,
                variables: {
                    input: {
                        proyecto: route.params.id
                    }
                },
                data: {
                    obtenerTareas: [...obtenerTareas, nuevaTarea]
                }
            })
        }
    })
    const { data, loading, error } = useQuery(OBTENER_TAREAS, {
        variables: {
            input: {
                proyecto: route.params.id
            }
        }
    })
    const mostrarAlerta = () => {
        Toast.show({
            text: mensaje,
            buttonText: 'OK',
            duration: 5000
        })
    }
    const handleSubmit = async () => {
        if (nombre === '') {
            setMensaje('El nombre es requerido')
            return
        }
        try {
            const { data } = await nuevaTarea({
                variables: {
                    input: {
                        nombre,
                        proyecto: route.params.id
                    }
                }
            })
            setNombre('')
            setMensaje('Tarea creada correctamente')
            setTimeout(() => {
                setMensaje(null)
            }, 3000);
        } catch (error) {
            setMensaje(error.message.replace('GraphQL error: ', ''))
        }
    }
    if (loading) return <Text>Cargando...</Text>
    return (
        <Container style={[globalStyles.contenedor], { backgroundColor: '#e84347' }}>
            <Form style={{ marginHorizontal: '2.5%', marginTop: 20 }}>
                <Item inlineLabel last style={globalStyles.input}>
                    <Input
                        placeholder='Nombre Tarea'
                        value={nombre}
                        onChangeText={(texto) => setNombre(texto)}
                    />
                </Item>
                <Button style={globalStyles.boton} square block onPress={() => handleSubmit()}>
                    <Text>
                        Crear Tarea
                    </Text>
                </Button>
            </Form>
            <H2 style={globalStyles.subtitulo}>Tareas: {route.params.nombre}</H2>
            <Content>
                <List style={styles.contenido}>
                    {data.obtenerTareas.map(tarea => (
                        <Tarea
                            key={tarea.id}
                            tarea={tarea}
                            proyectoId={route.params.id}
                        />
                    ))}
                </List>
            </Content>
            {mensaje && mostrarAlerta()}
        </Container>
    )
}
const styles = StyleSheet.create({
    contenido: {
        backgroundColor: '#fff',
        marginHorizontal: '2.5%'
    }
})
export default Proyecto
