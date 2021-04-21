import React, { useState, useEffect } from 'react';
import './App.css';
import { API, Storage, Analytics } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
import Navbar from './components/Navbar';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import NewPage from './components/NewPage';

const initialFormState = { name: '', post: '', category: '' }

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(notesFromAPI.map(async note => {
          if (note.image) {
            const image = await Storage.get(note.image);
            note.image = image;
          }
          return note;
    }))
    setNotes(apiData.data.listNotes.items);
  }

  async function createNote() {
    if (!formData.name || !formData.post || !formData.category) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  }

  async function deleteNote({ id }) {
    // Delete analytics
    Analytics.record({ name: "delete", attributes: { id } });
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }

  async function onChange(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    await Storage.put(file.name, file);
    fetchNotes();
  }

  return (
    <div className="App">
      <h1>My Blog App</h1>
      <Router>
          <Navbar/>
          <Switch>
            <Route path='/newPage' component={NewPage} />
            <Route path='/snapchat' component={() => { window.location = 'https://www.snapchat.com'; return null;} }/>
            <Route path='/burger' component={() => { window.location = 'https://sallysbakingaddiction.com/best-black-bean-burgers/'; return null;} }/>
          </Switch>
      </Router>
      
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Blog title"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'category': e.target.value})}
        placeholder="Blog category"
        value={formData.category}
      />
      <input
        onChange={e => setFormData({ ...formData, 'post': e.target.value})}
        placeholder="Blog post"
        value={formData.post}
      />
      <br />
      <label class="custom-file-upload">
            Add image (optional):
            <input
            type="file"
            onChange={onChange}
            />
      </label>
      <br />
      <br />
      <button onClick={createNote}>Create Note</button>
      <div style={{marginBottom: 30}}>
      {
          notes.map(note => (
                             <div key={note.name}  style={{marginTop: '60px'}}>
              <h2>{note.name}</h2>
              <p>Category: {note.category}</p>
              {
                note.image && <img src={note.image} style={{width: 400}} alt=""/>
              }
              <p>{note.post}</p>
              <br />
              <button onClick={() => deleteNote(note)}>Delete post</button>
            </div>
          ))
      }
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);
