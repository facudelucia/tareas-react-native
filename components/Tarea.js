import { Icon, Left, ListItem, Right, Text } from 'native-base'
import React from 'react'
import { Alert, StyleSheet } from 'react-native'
import { gql, useMutation } from '@apollo/client'

const ACTUALIZAR_TAREA = gql`
    mutation actualizarTarea($id: ID!, $input: TareaInput, $estado: Boolean){
        actualizarTarea(id: $id, input: $input, estado: $estado){
            nombre
            id
            proyecto
            estado
        }
    }
`
const ELIMINAR_TAREA = gql`
    mutation eliminarTarea($id: ID!){
        eliminarTarea(id: $id)
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
const Tarea = ({ tarea, proyectoId }) => {
    const [actualizarTarea] = useMutation(ACTUALIZAR_TAREA)
    const [eliminarTarea] = useMutation(ELIMINAR_TAREA, {
        update(cache) {
            const { obtenerTareas } = cache.readQuery({
                query: OBTENER_TAREAS,
                variables: {
                    input: {
                        proyecto: proyectoId
                    }
                }
            })
            cache.writeQuery({
                query: OBTENER_TAREAS,
                variables: {
                    input: {
                        proyecto: proyectoId
                    }
                },
                data: {
                    obtenerTareas: obtenerTareas.filter(tareaActual => tareaActual.id !== tarea.id)
                }
            })
        }
    })
    const cambiarEstado = async () => {
        try {
            const { data } = await actualizarTarea({
                variables: {
                    id: tarea.id,
                    input: {
                        nombre: tarea.nombre
                    },
                    estado: !tarea.estado
                }
            })
        } catch (error) {
            console.log(error)
        }
    }
    const mostrarEliminar = () => {
        Alert.alert('Eliminar tarea', '¿Deseas eliminar esta tarea?', [
            {
                text: 'Cancelar',
                style: 'cancel'
            },
            {
                text: 'Confirmar',
                onPress: () => eliminarTareaId()
            }
        ])
    }
    const eliminarTareaId = async () => {
        const { id } = tarea
        try {
            const { data } = await eliminarTarea({
                variables: {
                    id
                }
            })
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <>
            <ListItem
                onPress={() => cambiarEstado()}
                onLongPress={() => mostrarEliminar()}
            >
                <Left>
                    <Text>
                        {tarea.nombre}
                    </Text>
                </Left>
                <Right>
                    {
                        tarea.estado
                            ? <Icon
                                style={[styles.icono, styles.completo]}
                                name='ios-checkmark-circle'
                            />
                            : <Icon
                                style={[styles.icono, styles.incompleto]}
                                name='ios-checkmark-circle'
                            />
                    }

                </Right>
            </ListItem>
        </>
    )
}
const styles = StyleSheet.create({
    icono: {
        fontSize: 32
    },
    completo: {
        color: 'green'
    },
    incompleto: {
        color: '#e1e1e1'
    }
})
export default Tarea
