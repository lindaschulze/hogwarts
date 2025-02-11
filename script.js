document.getElementById("sort-button").addEventListener("click", function() {
    const houses = ["Gryffindor", "Hufflepuff", "Ravenclaw", "Slytherin"];
    const randomHouse = houses[Math.floor(Math.random() * houses.length)];
    document.getElementById("house-result").textContent = "You belong to " + randomHouse + "!";
});
