function sum(a, b) {
  return a + b;
}
console.log("1) sum(2, 3) =", sum(2, 3));
console.log("1) sum(2, '3') =", sum(2, "3"));

const square = (x) => {
  return x * x;
};
console.log("2) square(4) =", square(4));

const original = { title: "Черновик", published: false };
const alias = original;
alias.published = true;
console.log("3) original.published =", original.published);
console.log("3) original === alias =", original === alias);

const books = [
  { id: 1, title: "JavaScript" },
  { id: 2, title: "HTTP" },
];
const copiedBooks = [...books];
copiedBooks[0].title = "Изменённая книга";
console.log("4) books[0].title =", books[0].title);
console.log("4) books === copiedBooks =", books === copiedBooks);

const oldBook = { id: 12, title: "Черновик", available: false };
const newBook = { ...oldBook, available: true };
console.log("5) oldBook.available =", oldBook.available);
console.log("5) newBook.available =", newBook.available);

function makeCaption(text = "Без названия") {
  return text;
}
console.log("6) makeCaption() =", makeCaption());
console.log("6) makeCaption(undefined) =", makeCaption(undefined));
console.log("6) makeCaption(null) =", makeCaption(null));