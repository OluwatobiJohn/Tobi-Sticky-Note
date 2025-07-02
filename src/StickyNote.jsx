import React, { useState, useEffect, useRef } from "react";

// Note: In your local environment, replace the state management below with localStorage
// localStorage isn't available in this demo environment, but the code is included for reference

const Note = ({ children, index, onChange, onRemove, id }) => {
  const [editing, setEditing] = useState(false);
  const [position] = useState(() => ({
    right: randomBetween(0, window.innerWidth - 150) + "px",
    top: randomBetween(0, window.innerHeight - 150) + "px",
    transform: "rotate(" + randomBetween(-15, 15) + "deg)",
  }));
  const noteRef = useRef(null);
  const textareaRef = useRef(null);

  function randomBetween(min, max) {
    return min + Math.ceil(Math.random() * max);
  }

  useEffect(() => {
    // Make note draggable (simplified version without jQuery)
    if (noteRef.current) {
      let isDragging = false;
      let currentX;
      let currentY;
      let initialX;
      let initialY;
      let xOffset = 0;
      let yOffset = 0;

      const dragStart = (e) => {
        if (e.type === "touchstart") {
          initialX = e.touches[0].clientX - xOffset;
          initialY = e.touches[0].clientY - yOffset;
        } else {
          initialX = e.clientX - xOffset;
          initialY = e.clientY - yOffset;
        }

        if (
          e.target === noteRef.current ||
          noteRef.current.contains(e.target)
        ) {
          isDragging = true;
        }
      };

      const dragEnd = () => {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
      };

      const drag = (e) => {
        if (isDragging) {
          e.preventDefault();

          if (e.type === "touchmove") {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
          } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
          }

          xOffset = currentX;
          yOffset = currentY;

          noteRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) ${position.transform}`;
        }
      };

      noteRef.current.addEventListener("mousedown", dragStart);
      document.addEventListener("mousemove", drag);
      document.addEventListener("mouseup", dragEnd);

      return () => {
        if (noteRef.current) {
          noteRef.current.removeEventListener("mousedown", dragStart);
        }
        document.removeEventListener("mousemove", drag);
        document.removeEventListener("mouseup", dragEnd);
      };
    }
  }, [position.transform]);

  const edit = () => {
    setEditing(true);
  };

  const save = () => {
    onChange(textareaRef.current.value, index);
    setEditing(false);
  };

  const remove = () => {
    onRemove(index);
  };

  const renderDisplay = () => (
    <div ref={noteRef} className="note" style={position}>
      <p>{children}</p>
      <span>
        <button
          onClick={edit}
          className="btn btn-primary"
          style={{ fontSize: "12px", padding: "4px 8px" }}
        >
          ✏️
        </button>
        <button
          onClick={remove}
          className="btn btn-danger"
          style={{ fontSize: "12px", padding: "4px 8px" }}
        >
          🗑️
        </button>
      </span>
    </div>
  );

  const renderForm = () => (
    <div ref={noteRef} className="note" style={position}>
      <textarea
        ref={textareaRef}
        defaultValue={children}
        className="form-control"
        style={{
          height: "75%",
          background: "rgba(255, 255, 255, .5)",
          border: "none",
          resize: "none",
          fontFamily: '"Shadows Into Light", Arial',
          fontSize: "18px",
          padding: "5px",
        }}
      />
      <button
        onClick={save}
        className="btn btn-success btn-sm"
        style={{
          position: "absolute",
          bottom: "5px",
          right: "5px",
          fontSize: "12px",
          padding: "4px 8px",
        }}
      >
        💾
      </button>
    </div>
  );

  return editing ? renderForm() : renderDisplay();
};

const Board = ({ count = 50 }) => {
  const [notes, setNotes] = useState([]);
  const [uniqueId, setUniqueId] = useState(0);

  // Load notes from localStorage on component mount
  useEffect(() => {
    // In your local environment, uncomment this code:
    /*
    const savedNotes = localStorage.getItem('stickyNotes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes);
      setNotes(parsedNotes);
      // Set the unique ID to be higher than any existing note ID
      const maxId = parsedNotes.reduce((max, note) => Math.max(max, note.id), 0);
      setUniqueId(maxId + 1);
    }
    */
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    // In your local environment, uncomment this code:
    /*
    localStorage.setItem('stickyNotes', JSON.stringify(notes));
    */
  }, [notes]);

  const nextId = () => {
    const id = uniqueId;
    setUniqueId((prev) => prev + 1);
    return id;
  };

  const add = (text) => {
    if (notes.length >= count) {
      alert(`Creating ${notes.length + 1} notes is ridiculous`);
      return;
    }

    setNotes((prev) => [
      ...prev,
      {
        id: nextId(),
        note: text,
      },
    ]);
  };

  const update = (newText, index) => {
    setNotes((prev) => {
      const newNotes = [...prev];
      newNotes[index].note = newText;
      return newNotes;
    });
  };

  const remove = (index) => {
    setNotes((prev) => {
      const newNotes = [...prev];
      newNotes.splice(index, 1);
      return newNotes;
    });
  };

  return (
    <div
      className="board"
      style={{
        height: "100vh",
        width: "100%",
        background: "#eab92d",
        background:
          "radial-gradient(ellipse at center, #eab92d 57%, #c79810 99%)",
        position: "relative",
        overflow: "hidden",
        margin: 0,
        padding: 0,
      }}
    >
      {notes.map((note, i) => (
        <Note
          key={note.id}
          id={note.id}
          index={i}
          onChange={update}
          onRemove={remove}
        >
          {note.note}
        </Note>
      ))}
      <button
        className="btn btn-sm btn-success"
        onClick={() => add("New Note")}
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          fontSize: "16px",
          padding: "8px 12px",
          zIndex: 1000,
        }}
      >
        ➕ Add Note
      </button>

      <style jsx>{`
        @import url(https://fonts.googleapis.com/css?family=Shadows+Into+Light);

        body,
        html {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
        }

        .note {
          height: 150px;
          width: 150px;
          background-color: #ffeb3b;
          margin: 2px 0;
          position: absolute;
          cursor: grab;
          box-shadow: 5px 5px 15px 0 rgba(0, 0, 0, 0.2);
          border-radius: 3px;
          user-select: none;
        }

        .note:active {
          cursor: grabbing;
        }

        .note p {
          font-size: 18px;
          padding: 8px;
          font-family: "Shadows Into Light", Arial, sans-serif;
          margin: 0;
          word-wrap: break-word;
          overflow: hidden;
          height: calc(100% - 40px);
        }

        .note:hover > span {
          opacity: 1;
        }

        .note > span {
          position: absolute;
          bottom: 5px;
          right: 5px;
          opacity: 0;
          transition: opacity 0.25s linear;
        }

        .note button {
          margin: 2px;
          border: none;
          border-radius: 3px;
          cursor: pointer;
        }

        .btn {
          display: inline-block;
          font-weight: 400;
          text-align: center;
          white-space: nowrap;
          vertical-align: middle;
          user-select: none;
          border: 1px solid transparent;
          line-height: 1.5;
          border-radius: 0.25rem;
          transition: color 0.15s ease-in-out,
            background-color 0.15s ease-in-out;
        }

        .btn-primary {
          color: #fff;
          background-color: #007bff;
          border-color: #007bff;
        }

        .btn-primary:hover {
          background-color: #0056b3;
          border-color: #004085;
        }

        .btn-danger {
          color: #fff;
          background-color: #dc3545;
          border-color: #dc3545;
        }

        .btn-danger:hover {
          background-color: #c82333;
          border-color: #bd2130;
        }

        .btn-success {
          color: #fff;
          background-color: #28a745;
          border-color: #28a745;
        }

        .btn-success:hover {
          background-color: #218838;
          border-color: #1e7e34;
        }

        .form-control {
          display: block;
          width: 100%;
          font-size: 1rem;
          font-weight: 400;
          line-height: 1.5;
          color: #495057;
          border: 1px solid #ced4da;
          border-radius: 0.25rem;
          transition: border-color 0.15s ease-in-out,
            box-shadow 0.15s ease-in-out;
        }

        .form-control:focus {
          color: #495057;
          border-color: #80bdff;
          outline: 0;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
      `}</style>
    </div>
  );
};

export default function StickyNotesApp() {
  return <Board count={50} />;
}
