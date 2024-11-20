import { View, Text , SafeAreaView} from 'react-native'
import React from 'react'
import Compas from 'components/navigation/compas'

const navigation = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
        <Compas/>
    </SafeAreaView>
  )
}

export default navigation