import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, TextField, Button, Snackbar, Alert } from '@mui/material';
import BreadcrumbTrail from '../../../components/common/BreadcrumbTrail';
// @ts-ignore
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
// @ts-ignore
import draftToHtml from 'draftjs-to-html';
// @ts-ignore
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  isRichText?: boolean;
}

// Editor toolbar options
const toolbarOptions = {
  options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link', 'history'],
  inline: {
    options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'],
  },
  blockType: {
    options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
  },
  list: {
    options: ['unordered', 'ordered'],
  },
};

const OnlineNotepadPage: React.FC = () => {
  const [note, setNote] = useState<Note>({ id: '', title: '', content: '', date: '', isRichText: true });
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [savedNotes, setSavedNotes] = useState<Note[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Load saved notes from localStorage on component mount
  useEffect(() => {
    const storedNotes = localStorage.getItem('onlineNotepad');
    if (storedNotes) {
      setSavedNotes(JSON.parse(storedNotes));
    }
  }, []);
  
  // Convert HTML content to Draft.js EditorState
  const convertHtmlToEditorState = (html: string) => {
    if (!html) return EditorState.createEmpty();
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      return EditorState.createWithContent(contentState);
    }
    return EditorState.createEmpty();
  };
  
  // Update editor content only when note ID changes or when first loading a note
  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      if (note.id && note.content) {
        setEditorState(convertHtmlToEditorState(note.content));
      } else if (!note.id) {
        setEditorState(EditorState.createEmpty());
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [note.id]); // Only depend on note.id, not content
  
  // Handle editor state changes
  const onEditorStateChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
    // Use a functional update to avoid stale closures
    const htmlContent = draftToHtml(convertToRaw(newEditorState.getCurrentContent()));
    setNote((prevNote: Note) => ({...prevNote, content: htmlContent}));
  };

    const saveNote = () => {
    if (!note.title.trim()) {
      setSnackbarMessage('Please enter a title for your note');
      setOpenSnackbar(true);
      return;
    }

    const currentDate = new Date().toLocaleString();
    let updatedNotes;

    if (currentNoteId) {
      // Update existing note
      updatedNotes = savedNotes.map(noteItem => 
        noteItem.id === currentNoteId 
          ? { ...noteItem, title: note.title, content: note.content, date: currentDate, isRichText: note.isRichText } 
          : noteItem
      );
      setSnackbarMessage('Note updated successfully');
    } else {
      // Create new note
      const newNote = {
        id: Date.now().toString(),
        title: note.title,
        content: note.content,
        date: currentDate,
        isRichText: true
      };
      updatedNotes = [...savedNotes, newNote];
      setCurrentNoteId(newNote.id);
      setSnackbarMessage('Note saved successfully');
    }

    setSavedNotes(updatedNotes);
    localStorage.setItem('onlineNotepad', JSON.stringify(updatedNotes));
    setOpenSnackbar(true);
  };

  const createNewNote = () => {
    setCurrentNoteId(null);
    setNote({
      id: '',
      title: '',
      content: '',
      date: '',
      isRichText: true
    });
  };

  const loadNote = (noteId: string) => {
    const foundNote = savedNotes.find((n: Note) => n.id === noteId);
    if (foundNote) {
      setCurrentNoteId(foundNote.id);
      setNote(foundNote);
    }
  };

  const deleteNote = (noteId: string) => {
    const updatedNotes = savedNotes.filter(note => note.id !== noteId);
    setSavedNotes(updatedNotes);
    localStorage.setItem('onlineNotepad', JSON.stringify(updatedNotes));
    
    if (currentNoteId === noteId) {
      createNewNote();
    }
    
    setSnackbarMessage('Note deleted successfully');
    setOpenSnackbar(true);
  };

  const downloadNote = () => {
    if (!note.content) return;
    
    const element = document.createElement('a');
    let content = note.content;
    
    // If it's rich text, we need to strip HTML tags for plain text download
    if (note.isRichText) {
      // Create a temporary div to parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = note.content;
      content = tempDiv.textContent || tempDiv.innerText || '';
    }
    
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${note.title || 'note'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  const  downloadHtml = () => {
    if (!note.content) return;
    
    // Create HTML document with the note content
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>${note.title || 'Note'}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
    h1, h2, h3, h4, h5, h6 { margin-top: 1em; margin-bottom: 0.5em; }
    p { margin-bottom: 1em; }
    ul, ol { margin-bottom: 1em; padding-left: 2em; }
    blockquote { border-left: 3px solid #ccc; margin-left: 0; padding-left: 1em; color: #666; }
    pre { background: #f5f5f5; padding: 1em; border-radius: 4px; overflow-x: auto; }
    code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>${note.title || 'Untitled Note'}</h1>
  ${note.content}
</body>
</html>`;
    
    const element = document.createElement('a');
    const file = new Blob([htmlContent], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = `${note.title || 'note'}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <BreadcrumbTrail sx={{ mb: 4 }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Online Notepad
        </Typography>
        <Typography variant="body1" paragraph>
          Create, edit, and save notes directly in your browser.
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
          <Box sx={{ width: { xs: '100%', md: '25%' }, p: 1.5 }}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Your Notes
              </Typography>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={createNewNote}
                sx={{ mb: 2 }}
              >
                New Note
              </Button>
              
              {savedNotes.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No saved notes yet.
                </Typography>
              ) : (
                <Box sx={{ maxHeight: '500px', overflow: 'auto' }}>
                  {savedNotes.map(note => (
                    <Paper 
                      key={note.id} 
                      elevation={1} 
                      sx={{ 
                        p: 1, 
                        mb: 1, 
                        cursor: 'pointer',
                        bgcolor: currentNoteId === note.id ? 'action.selected' : 'background.paper'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box onClick={() => loadNote(note.id)}>
                          <Typography variant="subtitle2" noWrap>
                            {note.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {note.date}
                          </Typography>
                        </Box>
                        <Button 
                          size="small" 
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>
          
          <Box sx={{ width: { xs: '100%', md: '75%' }, p: 1.5 }}>
            <Paper sx={{ p: 3 }}>
              <TextField
                label="Note Title"
                fullWidth
                value={note.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNote({...note, title: e.target.value})}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Note Content</Typography>
              <Box sx={{ mb: 3 }}>
                <Editor
                  editorState={editorState}
                  onEditorStateChange={onEditorStateChange}
                  toolbar={toolbarOptions}
                  editorStyle={{
                    height: '350px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    overflow: 'auto'
                  }}
                  // Add these props to fix typing issues
                  preserveSelectionOnBlur={true}
                  stripPastedStyles={false}
                />
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Button 
                    variant="contained" 
                    onClick={saveNote}
                    disabled={!note.content}
                  >
                    Save Note
                  </Button>
                </Box>
                <Box>
                  <Button 
                    variant="outlined" 
                    onClick={downloadNote}
                    disabled={!note.content}
                  >
                    Download as Text
                  </Button>
                </Box>
                <Box>
                  <Button 
                    variant="outlined" 
                    onClick={downloadHtml}
                    disabled={!note.content}
                    color="secondary"
                  >
                    Download as HTML
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
        
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert onClose={() => setOpenSnackbar(false)} severity="success">
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default OnlineNotepadPage;
