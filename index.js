const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const app = express();

const fs = require("fs");

const schema = buildSchema(`
  type NumDays {
    num_days: Int
  }
  type File {
  file_size:Int
  }

  type Mutation {
    saveContents(contents:String):File 
  }

  type Query {
    dates(start_date:String,end_date:String):NumDays,
    getContents(contents:String):File
  }
`);

class File {
  constructor(contents) {
    this.contents = contents;
  }

  file_size() {
    fs.writeFile("./contents.txt", this.contents, function (err) {
      if (err) {
        return console.log(err);
      }
    });
    const stats = fs.statSync("contents.txt");
    const fileSizeInBytes = stats.size;
    return fileSizeInBytes;
  }
}

class NumDays {
  constructor(startDate, endDate) {
    this.start_date = startDate;
    this.end_date = endDate;
  }

  num_days() {
    const startDate = new Date(this.start_date);
    const endDate = new Date(this.end_date);
    const differenceInTime = endDate.getTime() - startDate.getTime();

    const betweenDays = differenceInTime / (1000 * 3600 * 24);
    return betweenDays;
  }
}

const rootValue = {
  dates: ({ start_date, end_date }) => {
    return new NumDays(start_date, end_date);
  },
  saveContents: ({ contents }) => {
    return new File(contents);
  },
  getContents: ({ contents }) => {
    return new File(contents);
  },
};

// Construct a schema, using GraphQL schema language
app.use(
  "/exam",
  graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
  })
);

app.listen(4000);
