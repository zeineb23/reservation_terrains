import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword,createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from 'firebase/firestore';
import db from '../configFirebase';
import '../css/Authcomponent.css'; // Import the CSS file
import Button from "react-bootstrap/esm/Button";
import Modal from "react-bootstrap/esm/Modal";

const AuthComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    user_name: '',
    user_lastname: '',
    email: '',
    password: '',
    role: 'user', 
  });
  const navigate = useNavigate();
  const auth = getAuth();

  // Function to handle login
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page reload
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/calendar');
    } catch (error) {
      setError("Échec de la connexion : " + error.message);
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
        role: newEvent.role ,
        status :'inactive'
      });

      setNewEvent({ user_name: '', user_lastname: '', email: '', password: '', role: 'user' });
      setModalIsOpen(false);
      alert('Your request has been sent successfully!');
    } catch (error) {
      console.error('Error adding user: ', error);
      alert('Failed to add user: ' + error.message);
    }
  };

  return (
    <div className="body_new">
    <div className="auth-container">
        <h2 className="title" style={{marginTop:"5%"}}>
            <img className="logo" src="https://th.bing.com/th/id/OIP.nTvhIwr__sWbjLxnhM3_BwHaHa?rs=1&pid=ImgDetMain"/>
            Tennis club Riadh Landalous
            <img className="logo" src="https://th.bing.com/th/id/OIP.nTvhIwr__sWbjLxnhM3_BwHaHa?rs=1&pid=ImgDetMain"/>
        </h2> 

      
      <form onSubmit={handleLogin}>
        <div>
          <table className="cnx_tab">
            <tr><td colspan="2"><h4>Connexion</h4></td> </tr>
            <tr>
              <td><label>Email:</label></td>
              <td><input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required/></td>
            </tr>
            <tr>
              <td><label>Mot de passe:</label></td>
              <td><input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          /></td>
            </tr>
            <tr>
              <td colspan="2">
              <center><Button variant="primary" type="submit">Se connecter</Button></center>
              {error && <p className="error-message">{error}</p>}
              </td>
          </tr>
          </table>
        </div>
        
      </form>
      <br/>
      <p>New member? <Button className="register_btn" onClick={() => setModalIsOpen(true)}>Register now</Button></p>
    </div>

    <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)}>
        <Modal.Header closeButton>
          <h4><img className="logo_2" src="https://th.bing.com/th/id/OIP.nTvhIwr__sWbjLxnhM3_BwHaHa?rs=1&pid=ImgDetMain"/>
          Welcome new user
          <img className="logo_2" src="https://th.bing.com/th/id/OIP.nTvhIwr__sWbjLxnhM3_BwHaHa?rs=1&pid=ImgDetMain"/>
          </h4>
        </Modal.Header>
        <Modal.Body className="new_form">
          
          <br/>
          <table className="register_tab">
          <tr><td colspan="2"><h5>Create your account</h5></td> </tr>

            <tr>
              <td> <label>
            First Name
            
          </label></td>
              <td><input
              type="text"
              value={newEvent.user_name}
              onChange={(e) => setNewEvent({ ...newEvent, user_name: e.target.value })}
            /></td>
            </tr>
            <tr>
              <td><label>
            Last Name
            
          </label></td>
              <td><input
              type="text"
              value={newEvent.user_lastname}
              onChange={(e) => setNewEvent({ ...newEvent, user_lastname: e.target.value })}
            /></td>
            </tr>
            <tr>
              <td><label>
            Email
            
          </label></td>
              <td><input
              type="email"
              value={newEvent.email}
              onChange={(e) => setNewEvent({ ...newEvent, email: e.target.value })}
            /></td>
            </tr>
            <tr>
              <td><label>
            Password
          </label></td>
              <td><input
              type="password"
              value={newEvent.password}
              onChange={(e) => setNewEvent({ ...newEvent, password: e.target.value })}
            /></td>
            </tr>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAddUser}>Send request</Button>
          <Button variant="secondary" onClick={() => setModalIsOpen(false)}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AuthComponent;
