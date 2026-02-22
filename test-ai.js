const resultId = process.argv[2];

async function test() {
    try {
        const res = await fetch("http://localhost:3000/api/magic-add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: "I just made a peanut butter and jelly sandwich with 2 slices of whole wheat bread, 2 tablespoons of peanut butter and 1 tablespoon of strawberry jelly. It took me 2 minutes." })
        });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Test failed", error);
    }
}

test();
