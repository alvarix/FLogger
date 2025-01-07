<script setup>
// import { IEntry } from '@/modules/EntryData'

function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

const testData = `Workout 2.1


12/21/24
- Blink 
- 915-
- :)7.5
- [ ] Hip thrust .6-3
- [ ] squat machine  .8-3
- [ ] Landmine twist  -4
- [ ] | Dips
- [ ] Pop Ups to box jump -4
- [ ] < S Leg X
(
- [ ] DB Twist
- [ ] < Inverted Row 
- [ ] Plank Reach .10
)
+  chores 
- :)7.5

12/14/24
- Mtk 
- 915-1115
- :)6 
- - hemmies
- [ ] + sprints 20s-4
3-5 Sets of each between 6-10 reps, 1:30-2 minutes of rest between sets
- [x] > Curtsy Lunge .6-4 15! ^30!
->
- [x] Lunge Twist .5 ^:15!
- L glute $4 R ham $2.5 from 3 days ago 
- [x] > DB Stairs .3-4 ^25! 30!
2-4 sets of each between 8-15 reps, 1-1:30 minutes of rest
(
- [ ] > Russian twists .12-3 15! 25!
- [ ] > DB BP Uni Floor Hip X .12-3 30! 30!^.20
- [x] 1
- [x] 2
- [x] 3
)
{  -2
Accessory: 2-3 sets of each between 12-20 reps, 1 minute rest
- [x] > ATG Lunge .15
- [x] > OH Tricep .20 20! 25!
- [x] Plank Reach .10 .12
}
+  chores 
- :)7.5






12/8/24
- Mtk 
- 1110-1240
- 6:) 
- - Still sore and hemmies $6
+ Box
3-5 Sets of each between 6-10 reps, 1:30-2 minutes of rest between sets
- [ ] < Hip thrust .6-3
- [ ] < Back Squat .8-3
- [x] > Curtsy Lunge .6-4 15!
- [ ] | Lunge Twist
- L glute $4 R ham $2.5 from 3 days ago 
- [x] > DB Stairs .3-4 ^25!
2-4 sets of each between 8-15 reps, 1-1:30 minutes of rest
(
- [ ] < Landmine twist  -4
- [ ] < Pop Ups to box jump -4
)(
- [x] > Russian twists .12-3 15!
- [x] > DB BP Uni Floor Hip X .12-3 30!
)
{ .20–2
Accessory: 2-3 sets of each between 12-20 reps, 1 minute rest
- [ ] < S Leg Press
- [ ] < Inverted Row 
- [x] > ATG Lunge .15! 
- raised 
- [x] > OH Tricep .20 20!
- [x] Plank Reach .10
}
+ chores 
- 7.5:)`;

// The following few steps convert array of
//    [date,entry,date,entry,...]
// into an array of objects with date and entry properties:
//    [{date, entry},{date, entry},...]
// Doing it in steps for better error handling
let splitItems, pretext, splitMappedItems, splitMappedFilteredItems;
try {
  splitItems = testData.split(
    /(?<!.)([0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{4}|[0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{2})\n|\n\n([0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{4}|[0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{2})\n/
  );

  let firstEntryIndex;
  splitMappedItems = splitItems.map((item, index, arr) => {
    if (isValidDate(item) && arr[index + 1]) {
      firstEntryIndex = firstEntryIndex || index;
      return { date: new Date(arr[index]), entry: arr[index + 1] };
    }
  });
  splitMappedFilteredItems = splitMappedItems.filter((item) => !!item);

  pretext = splitItems.reduce((prev, current, index) => {
    if (index < firstEntryIndex) {
      console.log("index", index, current);
      console.log((prev || "") + (current || ""));
      // UNRESOLVED: Not sure if this should insert the \n or not
      return (prev || "") + (current || "") + "\n";
    } else {
      return prev;
    }
  }, "");
  console.log("pretext", pretext);

  // let splitFilteredItems,
  //   splitFilteredMappedItems,
  //   splitFilteredMappedFilteredItems;

  // // Filter out empty items and non-date initial items (pretext)
  // splitFilteredItems = splitItems.filter(
  //   (item, index) => item && item != "\n" && !(index == 0 && !isValidDate(item))
  // );
  // // Convert array of [date,entry,date,entry,...] into [{date, entry},{date, entry},...]
  // splitFilteredMappedItems = splitFilteredItems.map((item, index, arr) =>
  //   index % 2 == 1
  //     ? { date: new Date(arr[index]), entry: arr[index + 1] }
  //     : undefined
  // );
  // // Filter out undefined remnants
  // splitFilteredMappedFilteredItems = splitFilteredMappedItems.filter(
  //   (item) => !!item
  // );

  // pretext = splitItems[0] || undefined;
} catch (e) {
  console.log("Error parsing flogger file content", e);
}
</script>

<template>
  <div>
    <h2>splitItems</h2>
    <ol>
      <li v-for="item in splitItems">{{ item }}</li>
    </ol>
    <h2>splitMappedItems</h2>
    <ol>
      <li v-for="item in splitMappedItems">{{ item }}</li>
    </ol>
    <h2>splitMappedFilteredItems</h2>
    <ol>
      <li v-for="item in splitMappedFilteredItems">{{ item }}</li>
    </ol>
    <h2>pretext</h2>
    <textarea style="border: 1px solid red; field-sizing: content">{{
      pretext
    }}</textarea>

    <!-- <h2>splitFilteredItems</h2>
    <ol>
      <li v-for="item in splitFilteredItems">{{ item }}</li>
    </ol>
    <h2>pretext</h2>
    <pre>{{ pretext }}</pre>
    <h2>splitFilteredMappedItems</h2>
    <ol>
      <li v-for="item in splitFilteredMappedItems">{{ item }}</li>
    </ol>
    <h2>splitFilteredMappedFilteredItems</h2>
    <ol>
      <li v-for="item in splitFilteredMappedFilteredItems">{{ item }}</li>
    </ol> -->
  </div>
</template>
