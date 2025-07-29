import BgUi from "../../assets/icons/bgUi.png";
import BgSoftware from "../../assets/icons/bgSoftware.png";
import BgCloud from "../../assets/icons/bgCloud.png";
import BgData from "../../assets/icons/bgData.png";

// Card data array
const TracksCards = [
  {
    title: "Software Engineering",
    Description:"Unlock your potential with our Software Engineering track, designed to equip you with the skills needed to excel in the tech industry.",
    value: " 400",
    duration: "12 weeks",
    program: [
      { label: "Node.js", bgColor: "#ECFDF3", textColor: "#027A48" },
      { label: "React.js", bgColor: "#F3F0FB", textColor: "#6941C6" },
    ],
    bgImg: BgSoftware,
  },
  {
    title: "Cloud Computing",
    Description:"Cloud Computing Expertise : Master the skills to design, deploy, and manage scalable cloud solutions with our comprehensive track.",
    value: " 350",
    duration: "12 weeks",
    program: [
      { label: "Azure", bgColor: "#F0F9FF", textColor: "#026AA2" },
      { label: "AWS", bgColor: "#F8F9FC", textColor: "#363F72" },
    ],
    bgImg: BgCloud,
  },
  {
    title: "Data Science",
    Description:"Data Science Mastery : Dive into the world of data with our track, where you'll learn to analyze, visualize, and derive insights from complex datasets.",
    value: " 400",
    duration: "12 weeks",
    program: [
      { label: "Power BI", bgColor: "#F7EDF6", textColor: "C11574" },
      { label: "Python", bgColor: "#E9F3FB", textColor: "#175CD3" },
    ],
    bgImg: BgData,
  },
  {
    title: "UI/UX",
    value: " 250",
    duration: "12 weeks",
    program: [
      { label: "Figma", bgColor: "#FFF4ED", textColor: "#B93815" },
      { label: "Sketch", bgColor: "#FFF1F3", textColor: "#C01048" },
    ],
    bgImg: BgUi,
  },
];

export default TracksCards;
