import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

interface HomeScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  age: string;
  grade: string;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // **Load data dari AsyncStorage saat aplikasi dibuka**
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const storedData = await AsyncStorage.getItem('students');
        if (storedData) {
          setStudents(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Gagal mengambil data dari AsyncStorage:', error);
      }
    };
    loadStudents();
  }, []);

  // **Simpan data ke AsyncStorage**
  const saveToStorage = async (data: Student[]) => {
    try {
      await AsyncStorage.setItem('students', JSON.stringify(data));
    } catch (error) {
      console.error('Gagal menyimpan ke AsyncStorage:', error);
    }
  };

  // **Tambah atau Edit Data**
  const saveStudent = () => {
    if (!name || !email || !age || !grade) {
      Alert.alert('Error', 'Semua kolom harus diisi!');
      return;
    }

    let updatedStudents: Student[];

    if (editId) {
      // **Edit Data**
      updatedStudents = students.map(s =>
        s.id === editId ? { id: editId, first_name: name, last_name: '', email, age, grade } : s
      );
      setEditId(null);
      Alert.alert('Sukses', 'Data siswa berhasil diperbarui!');
    } else {
      // **Tambah Data Baru**
      const newStudent: Student = {
        id: Date.now().toString(),
        first_name: name,
        last_name: '',
        email,
        age,
        grade,
      };
      updatedStudents = [...students, newStudent];
      Alert.alert('Sukses', 'Siswa berhasil ditambahkan!');
    }

    setStudents(updatedStudents);
    saveToStorage(updatedStudents);

    // Reset input
    setName('');
    setEmail('');
    setAge('');
    setGrade('');
  };

  // **Hapus Data Siswa**
  const deleteStudent = (id: string) => {
    Alert.alert(
      "Konfirmasi",
      "Apakah Anda yakin ingin menghapus siswa ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            const updatedStudents = students.filter(student => student.id !== id);
            setStudents(updatedStudents);
            saveToStorage(updatedStudents);
            Alert.alert('Sukses', 'Siswa berhasil dihapus!');
          }
        }
      ]
    );
  };

  // **Edit Data Siswa**
  const editStudent = (student: Student) => {
    setName(student.first_name);
    setEmail(student.email);
    setAge(student.age);
    setGrade(student.grade);
    setEditId(student.id);
  };

  // **Lihat Detail Siswa**
  const viewStudent = (student: Student) => {
    setSelectedStudent(student);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRUD Data Siswa</Text>

      {/* Form Tambah / Edit */}
      <TextInput style={styles.input} placeholder="Nama" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Umur" value={age} onChangeText={setAge} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Kelas" value={grade} onChangeText={setGrade} />
      <Button title={editId ? "Update Siswa" : "Tambah Siswa"} onPress={saveStudent} />

      {/* List Data Siswa */}
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.studentItem}>
            <TouchableOpacity onPress={() => viewStudent(item)}>
              <Text style={styles.studentName}>{item.first_name} {item.last_name}</Text>
            </TouchableOpacity>
            <View style={styles.buttonGroup}>
              <Button title="Edit" onPress={() => editStudent(item)} />
              <Button title="Hapus" onPress={() => deleteStudent(item.id)} color="red" />
            </View>
          </View>
        )}
      />

      <Button title="Logout" onPress={() => navigation.replace('Login')} />

      {/* Modal Detail Siswa */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Detail Siswa</Text>
            {selectedStudent && (
              <>
                <Text>Nama: {selectedStudent.first_name} {selectedStudent.last_name}</Text>
                <Text>Email: {selectedStudent.email}</Text>
                <Text>Umur: {selectedStudent.age}</Text>
                <Text>Kelas: {selectedStudent.grade}</Text>
              </>
            )}
            <Button title="Tutup" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// **Style**
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  studentItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  studentName: { fontSize: 16, fontWeight: 'bold' },
  buttonGroup: { flexDirection: 'row', gap: 10 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' },
});

export default HomeScreen;
