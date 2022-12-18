const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const app = express();

const fs = require("fs");

const schemaDates = buildSchema(`
  type NumDays {
    num_days: Int
  }

  type Query {
    dates(start_date:String,end_date:String):NumDays
  }
`);

const schemaContents = buildSchema(`
 type File {
    file_size:Int
  }

  type Query {
    getContents(contents:String): File
  }

  type Mutation {
    saveContents(contents:String):File
  }
`);

class File {
  constructor(contents) {
    this.contents = contents;
  }

  file_size() {
    fs.writeFile("./contents.txt", this.contents, function(err) {
      if (err) {
        return console.log(err);
      }
    });
    const stats = fs.statSync("contents.txt")
    const fileSizeInBytes = stats.size;
    return fileSizeInBytes
  }
}

const rootValueContents = {
  getContents: ({ contents }) => {
    return new File(contents)
  },
  saveContents: ({ contents }) => {
    return new File(contents)
  },
};

class NumDays {
  constructor(startDate, endDate) {
    this.start_date = startDate;
    this.end_date = endDate
  }

  num_days() {
    const startDate = new Date(this.start_date);
    const endDate = new Date(this.end_date);
    const differenceInTime = endDate.getTime() - startDate.getTime();

    const betweenDays = differenceInTime / (1000 * 3600 * 24);
    return betweenDays
  }

}
const rootValueDates = {
  dates: ({ start_date, end_date }) => {
    return new NumDays(start_date, end_date)
  },
};

// Construct a schema, using GraphQL schema language
app.use(
  '/dates',
  graphqlHTTP({
    schema: schemaDates,
    rootValue: rootValueDates,
    graphiql: true,
  }),
);

app.use(
  '/contents',
  graphqlHTTP({
    schema: schemaContents,
    rootValue: rootValueContents,
    graphiql: true,
  }),
);

app.listen(4000);
