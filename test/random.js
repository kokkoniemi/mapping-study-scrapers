(async () => {
    const start = 1001;
    const end = 2000;
    const randomNum = () => Math.floor(Math.random() * (end - start + 1) + start);
    const numbers = [];
    for (let i = 0; i < 50; i++) {
        let candidate = randomNum();
        while (numbers.includes(candidate)) {
            candidate = randomNum();
        }
        numbers.push(candidate);
    }
    numbers.sort((a, b) => a - b);
    console.log(numbers);
})();