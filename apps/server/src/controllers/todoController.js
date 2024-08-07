const { mongoose } = require("mongoose");
const Todo = require("../models/todoModel");
const { Subject } = require("rxjs");

// Get all todos
exports.getTodos = async (req, res) => {
  try {
    const todos = await Todo.find();
    return res.status(200).json({ success: true, todos: res.json(todos) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new todo
exports.createTodo = async (req, res) => {
  try {
    const newTodo = new Todo({
      id: req.body.id,
      name: req.body.name,
      status: req.body.status || "not-started",
    });
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// used in the pull.stream$ below
let lastEventId = 0;
const pullStream$ = new Subject();

exports.pushTodos = async (req, res) => {
  try {
    const changeRows = req.body;
    const conflicts = [];
    const event = {
      id: lastEventId++,
      documents: [],
      checkpoint: null,
    };
    console.log(changeRows, "changeRows");
    for (const changeRow of changeRows) {
      const realMasterState = await Todo.findOne({
        _id: changeRow.newDocumentState._id,
      });
      if (
        // assumedMasterState: client thought BE has data like that
        // realMasterState : real data in server
        // Example case: Disable network
        // Data in client vs BE has conflict
        (realMasterState && !changeRow.assumedMasterState) ||
        (realMasterState &&
          changeRow.assumedMasterState &&
          /*
           * For simplicity we detect conflicts on the server by only compare the updateAt value.
           * In reality you might want to do a more complex check or do a deep-equal comparison.
           */
          realMasterState.updatedAt !== changeRow.assumedMasterState.updatedAt)
      ) {
        // we have a conflict
        conflicts.push(realMasterState);
      } else {
        // no conflict -> write the document
        if (realMasterState) {
          if (changeRow.newDocumentState._deleted) {
            await Todo.deleteOne({ _id: changeRow.newDocumentState._id });
          } else {
            await Todo.updateOne(
              { _id: changeRow.newDocumentState._id },
              { $set: changeRow.newDocumentState }
            );
          }
        } else {
          await Todo.create({ ...changeRow.newDocumentState });
        }

        event.documents.push(changeRow.newDocumentState);
        event.checkpoint = {
          id: changeRow.newDocumentState._id,
          updatedAt: changeRow.newDocumentState.updatedAt,
        };

        if (event.documents.length > 0) {
          pullStream$.next(event);
        }
      }
    }

    res.status(200).json({
      success: true,
      data: { conflicts },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const lastOfArray = (arr) => arr[arr.length - 1];

exports.pullTodos = async (req, res) => {
  try {
    const id = req.query.id;
    const updatedAt = parseFloat(req.query.minUpdatedAt);
    const limit = parseInt(req.query.limit);
    const userObjectId = new mongoose.Types.ObjectId(req.user._id);

    const documents = await Todo.find({
      user: userObjectId,
      $or: [
        {
          updatedAt: { $gt: updatedAt },
        },
        {
          updatedAt: { $eq: updatedAt },
          _id: { $gt: id }, // Ensure to use _id for MongoDB's primary key
        },
      ],
    })
      .limit(limit)
      .exec(); // Execute the query to return a promise

    const newCheckpoint =
      documents.length === 0
        ? { id, updatedAt }
        : {
            id: lastOfArray(documents)._id,
            updatedAt: lastOfArray(documents).updatedAt,
          };

    res.status(200).json({
      success: true,
      data: { documents, checkpoint: newCheckpoint },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.pullStream = (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  });
  const subscription = pullStream$.subscribe((event) => {
    res.write("data: " + JSON.stringify(event) + "\n\n");
  });
  req.on("close", () => {
    subscription.unsubscribe();
  });
};
