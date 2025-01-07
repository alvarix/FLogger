<script setup>
import { deserializeEntries } from "@/modules/Flog";
// import { IEntry } from '@/modules/EntryData'

const rawEntryContent0 = `Workout 2.1


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

const rawEntryContentX = `
10/30/2024
One linebreaks in pretext

10/30/2024
Save 4

10/30/2024
Save 3

10/30/2024
Save 2



5/2/2024
Something else




10/9/2024
db from form

10/10/2024
Something else


`;

const rawEntryContentEmpty = ``;

const rawEntryContent1 = `10/30/2024
No pretext at all

10/30/2024
middle entry

10/28/2024
earliest entry
`;

const rawEntryContent2 = `
10/30/2024
One linebreak only pretext

10/30/2024
middle entry

10/28/2024
earliest entry
`;

const rawEntryContent3 = `

10/30/2024
Two linebreaks only pretext

10/30/2024
middle entry

10/28/2024
earliest entry
`;

const rawEntryContent4 = `
Pretext with starting linebreak
more

more

10/30/2024
latest entry

10/30/2024
middle entry

10/28/2024
earliest entry
`;

function isValidDate(dateString) {
  // const date = new Date(dateString);
  // return !isNaN(date.getTime());
  return /([0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{4}|[0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{2})/.test(
    dateString
  );
}
let filteredEntries, pretext;
let splitItems, filteredItems, itemsMappedToEntries;
try {
  // The following few steps convert array of
  //    [date,entry,date,entry,...]
  // into an array of objects with date and entry properties:
  //    [{date, entry},{date, entry},...]

  splitItems = rawEntryContent0.split(
    /(?<!.)([0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{4}|[0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{2})\n|\n\n([0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{4}|[0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{2})\n/
  );
  filteredItems = splitItems.filter((item) => !!item);
  itemsMappedToEntries = filteredItems.map((item, index, arr) => {
    if (isValidDate(item) && arr[index + 1]) {
      return { date: new Date(arr[index]), entry: arr[index + 1] };
    }
  });
  filteredEntries = itemsMappedToEntries.filter((item) => !!item);

  // "pretext" found before the first date is not returned by this deserializeEntries function (... yet?)
  // But this is how it can be parsed out here, after already splitting by date:
  let firstEntryFound = false;
  pretext = splitItems.reduce((prev, item, index, arr) => {
    if (!firstEntryFound && isValidDate(item)) {
      firstEntryFound = true;
    }
    if (firstEntryFound) {
      return prev;
    } else {
      return (prev || "") + (item || "") + "\n";
    }
  }, undefined);
} catch (e) {
  console.log("Error parsing flogger file content", e);
  console.log("rawEntryContent0", rawEntryContent0);
  // return [];
}

</script>

<template>
  <div>
    <h2>splitItems</h2>
    <ol>
      <li v-for="item in splitItems">{{ item }}</li>
    </ol>
    <h2>filteredItems</h2>
    <ol>
      <li v-for="item in filteredItems">{{ item }}</li>
    </ol>
    <h2>itemsMappedToEntries</h2>
    <ol>
      <li v-for="item in itemsMappedToEntries">{{ item }}</li>
    </ol>
    <h2>filteredEntries</h2>
    <ol>
      <li v-for="item in filteredEntries">{{ item }}</li>
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
