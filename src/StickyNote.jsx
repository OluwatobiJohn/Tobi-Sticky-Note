import React, { useState, useEffect, useRef } from "react";

const Note = ({ note, onChange, onRemove, onPositionChange }) => {
  const [editing, setEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const noteRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Simple drag functionality
    if (noteRef.current) {
      let isDragging = false;
      let startX, startY, initialX, initialY;

      const handleMouseDown = (e) => {
        // Don't start dragging if clicking on buttons or textarea
        if (e.target.tagName === "BUTTON" || e.target.tagName === "TEXTAREA") {
          return;
        }

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = noteRef.current.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        e.preventDefault();
      };

      const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const newLeft = initialX + deltaX;
        const newTop = initialY + deltaY;
        noteRef.current.style.left = newLeft + "px";
        noteRef.current.style.top = newTop + "px";
      };

      const handleMouseUp = (e) => {
        if (isDragging) {
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;
          const newLeft = initialX + deltaX;
          const newTop = initialY + deltaY;

          // Update the position in the parent component
          onPositionChange(note.id, {
            left: newLeft + "px",
            top: newTop + "px",
            transform: note.position.transform,
          });
        }
        isDragging = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      noteRef.current.addEventListener("mousedown", handleMouseDown);

      return () => {
        if (noteRef.current) {
          noteRef.current.removeEventListener("mousedown", handleMouseDown);
        }
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [note.id, note.position, onPositionChange]);

  const noteStyles = {
    position: "absolute",
    width: "200px",
    height: "200px",
    backgroundColor: "#ffeb3b",
    padding: "10px",
    borderRadius: "5px",
    boxShadow: "3px 3px 10px rgba(0,0,0,0.3)",
    cursor: "move",
    fontFamily: "Arial, sans-serif",
    ...note.position,
  };

  const buttonStyles = {
    margin: "5px",
    padding: "5px 10px",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
  };

  if (editing) {
    return (
      <div
        ref={noteRef}
        style={noteStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <textarea
          ref={textareaRef}
          defaultValue={note.text}
          style={{
            width: "100%",
            height: "120px",
            border: "none",
            background: "transparent",
            fontSize: "14px",
            resize: "none",
            outline: "none",
            color: "black",
          }}
        />
        <button
          onClick={() => {
            onChange(note.id, textareaRef.current.value);
            setEditing(false);
          }}
          style={{
            ...buttonStyles,
            backgroundColor: "#4CAF50",
            color: "white",
          }}
        >
          Save
        </button>
      </div>
    );
  }

  return (
    <div
      ref={noteRef}
      style={noteStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          height: "120px",
          overflow: "hidden",
          fontSize: "14px",
          marginBottom: "10px",
          color: "black",
        }}
      >
        {note.text}
      </div>
      {isHovered && (
        <>
          <button
            onClick={() => setEditing(true)}
            style={{
              ...buttonStyles,
              backgroundColor: "#2196F3",
              color: "white",
            }}
          >
            Edit
          </button>
          <button
            onClick={() => onRemove(note.id)}
            style={{
              ...buttonStyles,
              backgroundColor: "#f44336",
              color: "white",
            }}
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
};

const StickyNotesApp = () => {
  const [notes, setNotes] = useState([]);
  const [nextId, setNextId] = useState(1);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("stickyNotes");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.notes && Array.isArray(data.notes)) {
          // Ensure all notes have positions
          const notesWithPositions = data.notes.map((note) => ({
            ...note,
            position: note.position || {
              left: Math.random() * (window.innerWidth - 250) + "px",
              top: Math.random() * (window.innerHeight - 250) + 100 + "px",
              transform: `rotate(${(Math.random() - 0.5) * 20}deg)`,
            },
          }));
          setNotes(notesWithPositions);
          setNextId(data.nextId || notesWithPositions.length + 1);
        }
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }, []);

  // Save to localStorage whenever notes change
  useEffect(() => {
    if (notes.length > 0 || nextId > 1) {
      try {
        localStorage.setItem(
          "stickyNotes",
          JSON.stringify({
            notes,
            nextId,
          })
        );
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }
  }, [notes, nextId]);

  const addNote = () => {
    const newNote = {
      id: nextId,
      text: "New Note - Click Edit to change this text",
      position: {
        left: Math.random() * (window.innerWidth - 250) + "px",
        top: Math.random() * (window.innerHeight - 250) + 100 + "px",
        transform: `rotate(${(Math.random() - 0.5) * 20}deg)`,
      },
    };
    setNotes((prevNotes) => [...prevNotes, newNote]);
    setNextId((prevId) => prevId + 1);
  };

  const updateNote = (id, newText) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, text: newText } : note
      )
    );
  };

  const updateNotePosition = (id, newPosition) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, position: newPosition } : note
      )
    );
  };

  const removeNote = (id) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <button
        onClick={addNote}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        + Add Note
      </button>

      {notes.map((note) => (
        <Note
          key={note.id}
          note={note}
          onChange={updateNote}
          onRemove={removeNote}
          onPositionChange={updateNotePosition}
        />
      ))}
    </div>
  );
};

export default StickyNotesApp;
