import Calendar1 from './Calendar1';
import Calendar2 from './Calendar2';
import Calendar3 from './Calendar3';
import '../App.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, doc, query, where, updateDoc } from 'firebase/firestore';
import db from '../configFirebase';

const CalendarView = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    user_name: '',
    user_lastname: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [userRole, setUserRole] = useState('user');
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const auth = getAuth();

  useEffect(() => {
    const fetchUserRole = async (userId) => {
      const uid = userId; 
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
        setUserRole(userDoc.role); 
        setNewEvent((prevState) => ({
          ...prevState,
          user_name: userDoc.user_name,
          user_lastname: userDoc.user_lastname,
          email: userDoc.email 
        }));
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserRole(user.uid); 
      }
    });

    return () => unsubscribe(); 
  }, [auth]);

  const handleClick = async () => {
    setModalIsOpen(true);
    const usersQuery = query(collection(db, 'users'), where('status', '==', 'inactive'));
    const querySnapshot = await getDocs(usersQuery);
    
    const inactiveUsersArray = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data(); 
      inactiveUsersArray.push({
        id: doc.id, 
        user_name: data.user_name,
        user_lastname: data.user_lastname,
        email: data.email,
        status: data.status,
      });
    });
  
    setInactiveUsers(inactiveUsersArray);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error during logout: ', error);
      alert('Failed to logout: ' + error.message);
    }
  };

  const handleAddUser = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newEvent.email,
        newEvent.password
      );

      const user = userCredential.user;

      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        user_name: newEvent.user_name,
        user_lastname: newEvent.user_lastname,
        email: newEvent.email,
        role: newEvent.role,
        status: 'active'
      });

      setNewEvent({ user_name: '', user_lastname: '', email: '', password: '', role: 'user' });
      setModalIsOpen(false);
      alert('User added successfully!');
    } catch (error) {
      console.error('Error adding user: ', error);
      alert('Failed to add user: ' + error.message);
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { status: 'active' });
      alert('User activated successfully!');
      handleClick(); // Refresh the list of inactive users
    } catch (error) {
      console.error('Error activating user: ', error);
      alert('Failed to activate user: ' + error.message);
    }
  };

  return (
    <div>
      <div className='header'>

      <div className='container'>
        <h2 className="title">
          <img className="logo_3" src="https://th.bing.com/th/id/OIP.nTvhIwr__sWbjLxnhM3_BwHaHa?rs=1&pid=ImgDetMain" alt="Tennis Logo" />
          Tennis club Riadh Landalous
          <img className="logo_3" src="https://th.bing.com/th/id/OIP.nTvhIwr__sWbjLxnhM3_BwHaHa?rs=1&pid=ImgDetMain" alt="Tennis Logo" />
        </h2>
      </div>
      <div className="headBtn">
        {userRole === 'admin' && (
          <Button onClick={handleClick}>Confirm accounts</Button>
        )}
        <Button variant="danger" onClick={handleLogout} style={{ marginLeft: '10px' }}>
          Logout
        </Button>
      </div>
      </div>
      <table className='tab'>
        <tbody>
          <tr>
            <td><Calendar1 /></td>
            <td><Calendar2 /></td>
            <td><Calendar3 /></td>
          </tr>
        </tbody>
      </table>

      <Modal size="lg" show={modalIsOpen} onHide={() => setModalIsOpen(false)}>
        <Modal.Header closeButton>
          <h2>Activate Users accounts</h2>
        </Modal.Header>
        <Modal.Body>
          <table className="activate_tab">
            <thead>
              <tr>
                <td>First name</td>
                <td>Last name</td>
                <td>Email name</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {inactiveUsers.length > 0 ? (
                inactiveUsers.map((user) => (
                  <tr key={user.id}> {/* Use user.id for a unique key */}
                    <td>{user.user_name}</td>
                    <td>{user.user_lastname}</td>
                    <td>{user.email}</td>
                    <td>
                      <Button onClick={() => handleActivateUser(user.id)}>Activate</Button> {/* Call handleActivateUser with user.id */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No inactive users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalIsOpen(false)}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CalendarView;
