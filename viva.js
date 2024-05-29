import { GoogleGenerativeAI } from "@google/generative-ai";
    if ('webkitSpeechRecognition' in window && 'speechSynthesis' in window) {
    const recognition = new webkitSpeechRecognition();
    let bossName = 'somesh chauhan';
    let verifiedUser = false;
    let speaking = false;
    let isShutdownRequested = false;
    let isListening = true;

    function getLocalTime() {
        const now = new Date();
        const hours = now.getHours();
    
        if (hours >= 5 && hours < 12) {
            return 'morning';
        } else if (hours >= 12 && hours < 18) {
            return 'afternoon';
        } else {
            return 'evening';
        }
    }

    let lastRecognitionTimestamp = Date.now();

    function startInactivityCheck() {
        const checkInterval = 600000; // 10 min
    
        setInterval(() => {
            const currentTime = Date.now();
            const elapsedTime = currentTime - lastRecognitionTimestamp;
    
            if (elapsedTime >= checkInterval) {
                // It has been a while since the last speech input, prompt a friendly message
                const randomResponses = [
                    "Hey there! It seems quiet. Want to chat or ask me something?",
                    "Did you forget about me? I'm still here for you!",
                    "Is everything okay? It's been a bit quiet. Let me know if you need anything.",
                    "I hope I didn't say something to upset you. Let's talk!",
                    "Are you lost in thought? Feel free to share what's on your mind."
                ];
                const friendlyMessage = getRandomResponse(randomResponses);
                if(!isShutdownRequested)
                {
                    speak(friendlyMessage);
                }
            }
        }, checkInterval);
    }
    
    // Function to update the timestamp when a speech recognition result is received
    function updateRecognitionTimestamp() {
        lastRecognitionTimestamp = Date.now();
    }
    

    function handleSearchCommand(query) {
        searchQuery = query;

        // Perform web search using the default browser behavior
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
        window.open(searchUrl, '_blank');

        // Optionally, you can speak a confirmation message
        speak(`I've performed a web search for "${searchQuery}".`);

        // Reset the search-related variables
        pendingSearchRequest = false;
        searchQuery = '';
    }

   


    function translateTextUsingWeb(text, targetLanguage) {
        const googleTranslateUrl = `https://translate.google.com/#view=home&op=translate&sl=auto&tl=${targetLanguage}&text=${encodeURIComponent(text)}`;
    
        // Open a new tab with the Google Translate URL
        window.open(googleTranslateUrl, '_blank');
    
        speak(`I've initiated a web-based translation for "${text}" to Hindi.`);
    }


    function handleTranslationCommand(command) {
        const regex = /translate (.+) to hindi/i;
        const match = command.match(regex);
    
        if (match) {
            const textToTranslate = match[1].trim();
            console.log('Text to translate:', textToTranslate);
    
            // Set the target language to Hindi
            const targetLanguage = 'hi';
            console.log('Target language:', targetLanguage);
    
            translateTextUsingWeb(textToTranslate, targetLanguage);
        } else {
            speak("I'm sorry, I didn't understand the translation command. Can you please repeat?");
        }
    }
    

    function getSocialMediaUpdates(apiKey) {
        const newsApiUrl = `https://newsapi.org/v2/top-headlines?category=social&apiKey=${apiKey}`;

        return fetch(newsApiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.articles && data.articles.length > 0) {
                    const updates = data.articles.map(article => ({
                        title: article.title,
                        description: article.description,
                        source: article.source.name,
                        url: article.url,
                    }));
                    return updates;
                } else {
                    return 'No social media updates found.';
                }
            })
            .catch(error => {
                console.error('Error fetching social media updates:', error);
                return 'An error occurred while fetching social media updates.';
            });
    }


    function handleSocialMediaUpdatesCommand(command) {
        const apiKey = '79337d4c6dc447e8b56f0436e398a4e4'; 

        const regex = /social media updates/i;
        const match = command.match(regex);

        if (match) {
            getSocialMediaUpdates(apiKey)
                .then(updates => {
                    // Speak information about social media updates
                    if (Array.isArray(updates)) {
                        const updatesInfo = updates.map(update => `${update.title} from ${update.source}. ${update.description}`).join('. ');
                        speak(`Here are some recent social media updates: ${updatesInfo}`);
                    } else {
                        speak(updates);
                    }
                });
        } else {
            speak("I'm sorry, I didn't understand the social media updates command. Can you please repeat?");
        }
    }
    
    function getRandomJoke() {
        const jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "What did the left eye say to the right eye? Between you and me, something smells.",
            "Why did the scarecrow win an award? Because he was outstanding in his field!",
            "How do you organize a space party? You planet!",
            "Why did the bicycle fall over? Because it was two-tired!",
            "What do you call fake spaghetti? An impasta!",
            "Why did the tomato turn red? Because it saw the salad dressing!",
            "What did one ocean say to the other ocean? Nothing, they just waved.",
            "Why don't skeletons fight each other? They don't have the guts!",
            "What's orange and sounds like a parrot? A carrot!",
            "Why did the math book look sad? Because it had too many problems.",
            "Did you hear about the cheese factory explosion? There was nothing left but de-brie.",
            "How does a penguin build its house? Igloos it together!",
            "What did the janitor say when he jumped out of the closet? Supplies!",
            "Why don't eggs tell each other secrets? Because they might crack up.",
            "How does a snowman get around? By riding an 'icicle!",
            "What did the grape do when it got stepped on? Nothing, but it let out a little wine.",
            "Why did the golfer bring two pairs of pants? In case he got a hole in one.",
            "What do you call a fish wearing a crown? A kingfish!",
            "Why did the computer keep its drink on the windowsill? Because it wanted a bit to drink."
        ];
    
        // Pick a random joke from the array
        const randomIndex = Math.floor(Math.random() * jokes.length);
        return jokes[randomIndex];
    }

    function getRandomResponse(responses) {
        const randomIndex = Math.floor(Math.random() * responses.length);
        return responses[randomIndex];
    }

    const musicTracks = [
        'allblack.mp3'
        
        // Add more tracks as needed
    ];

    function handleMusicCommand(command) {
        if (musicTracks.length === 0) {
            speak("I'm sorry, but I couldn't find any music tracks.");
            return;
        }
    
        // Randomly select a music track
        const randomIndex = Math.floor(Math.random() * musicTracks.length);
        const selectedTrack = musicTracks[randomIndex];
    
        // Simulate playing the music (replace this with your actual music playback logic)
        playMusic(selectedTrack);
    }
    
    // Example function to simulate playing music (replace this with your actual music playback logic)
    function playMusic(track) {
        // Implement your music playback logic here.
        // For simplicity, this example logs the selected track to the console.
        console.log(`Now playing: ${track}`);
        speak(`Now playing: ${track}`);
    }

    function handleScreenshotCommand(command) {
        // Capture a screenshot
        const screenshotDataUrl = captureScreenshot();
    
        if (screenshotDataUrl) {
            speak("Screenshot captured successfully.");
            // You can use the screenshotDataUrl as needed, such as displaying it in an image element or sending it to a server.
        } else {
            speak("Sorry, I couldn't capture the screenshot at the moment. Please try again.");
        }
    }
    
    // Example function to simulate taking a screenshot (replace this with your actual screenshot capture logic)
    function captureScreenshot() {
        try {
            // Create a canvas element
            const canvas = document.createElement('canvas');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
    
            // Get the 2D context of the canvas
            const context = canvas.getContext('2d');
    
            // Draw the current window onto the canvas
            context.drawWindow(window, 0, 0, window.innerWidth, window.innerHeight, 'rgb(255,255,255)');
    
            // Convert the canvas content to a data URL
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Error capturing screenshot:', error);
            return null;
        }
    }

    function handleStoryCommand(command) {
        // Generate and speak an integrated set of stories in English
        const storySet = generateIntegratedEnglishStories();
        speak(storySet);
    }
    
    // Example function to generate an integrated set of stories in English
    function generateIntegratedEnglishStories() {
        const integratedEnglishStories = [
            "In the dimly lit corridors of the world's most advanced research facility, Dr. Emily Harper, a brilliant cryptographer, stumbled upon a mysterious encrypted message. The code, unlike anything she had encountered before, emanated an aura of secrecy that sent shivers down her spine. The message was simple yet cryptic: The Key Lies Within. Driven by an insatiable curiosity, Emily embarked on a relentless quest to unravel the enigma behind the code. Little did she know that this journey would lead her into the heart of a centuries-old conspiracy that had remained hidden in the shadows.As Emily delved deeper into the code, she discovered a series of intricate patterns that seemed to defy the laws of mathematics. The more she deciphered, the more questions arose. Each layer of the code revealed a new puzzle, sending her on a labyrinthine trail through history, literature, and the cutting edge of quantum computing. Haunted by the mystery, Emily assembled a team of experts from various fields. Together, they unraveled clues that pointed to a clandestine organization known only as The Eclipse. The deeper they delved, the more they realized that The Eclipse had manipulated events throughout history, leaving behind a trail of hidden messages. The encrypted code seemed to be the key to unlocking a power that could reshape the world. The race against time intensified as Emily and her team discovered that The Eclipse had operatives within their ranks, sabotaging their progress and leaving misleading breadcrumbs. As the suspense reached a fever pitch, Emily's team found themselves on the precipice of a breakthrough. The final layer of the code revealed coordinates that led to an ancient underground chamber. In that chamber, they discovered a device of unimaginable power — a relic from an advanced civilization that predated recorded history. The Eclipse, aware of Emily's progress, launched a desperate final assault to seize the device. A high-stakes showdown ensued, filled with twists and betrayals. In the heart of the ancient chamber, Emily deciphered the last fragments of the code, activating the device just as The Eclipse closed in. The world seemed to shift as the device unleashed a wave of energy, revealing hidden truths about the nature of reality itself. The Eclipse's machinations were laid bare, and the enigma code became a safeguard against their manipulations. In the aftermath, the world grappled with the revelations, and Emily.",
            
            "Story 2: A little child learned to play in the fields during the rainy season for many days. Growing up, the child became an excellent athlete. This story teaches us that even in small things, there can be immense joy, and we can find happiness in any environment if we work hard.",
            
            "Story 3: A young man decided to leave his village and work in a new place. There, he made new friends and learned new skills. Gradually, his hard work brought him success. This story teaches us that facing new challenges and embracing new experiences can contribute to stability and success.",
            // Add more integrated stories as needed
        ];
    
        // Choose a random set of integrated English stories
        const randomIndex = Math.floor(Math.random() * integratedEnglishStories.length);
        return integratedEnglishStories[randomIndex];
    }
    


    

    function getWeatherReport(location) {
        

        const openWeatherMapApiKey = '34dfb8dad7a46347c078f239c50fd7fe';


        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${openWeatherMapApiKey}`;
    
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const weatherDescription = data.weather[0].description;
                const temperature = Math.round(data.main.temp - 273.15); // Convert temperature from Kelvin to Celsius
    
                const weatherMessage = `The weather today in ${location} is ${weatherDescription} with a temperature of ${temperature} degrees Celsius.`;
    
                speak(weatherMessage);
            })
            .catch(error => {
                console.error("Error fetching weather data:", error);
                speak("I'm sorry, but I couldn't retrieve the weather information at the moment.");
            });
    }

    
    
    

    

    function speak(message) {
        speaking = true;
        const speech = new SpeechSynthesisUtterance(message);
        speech.volume = 1;
        speech.rate = 1;
        speech.pitch = 1;
    
        function setVoice() {
            const voices = window.speechSynthesis.getVoices();
            let ukVoice = voices.find(voice => voice.lang === 'en-GB');
            if (!ukVoice && voices.length > 0) {
                ukVoice = voices[0]; // Fallback to the first available voice if UK voice is not found
            }
            if (ukVoice) {
                speech.voice = ukVoice;
            }
            window.speechSynthesis.speak(speech);
        }
    
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                setVoice();
                window.speechSynthesis.onvoiceschanged = null; // Remove the event listener after use
            };
        } else {
            setVoice();
        }
    
        speech.onend = () => {
            speaking = false;
            startRecognition();
        };
    }





    let reminders = [];

function setReminder(task, time) {
    const reminderTime = new Date(time);

    reminders.push({ task, time: reminderTime });
}

function checkReminders() {
    const currentTime = new Date();

    reminders.forEach((reminder, index) => {
        if (currentTime.getTime() === reminder.time.getTime()) {
            speak(`Reminder: ${reminder.task}`);
            
            reminders.splice(index, 1);
        }
    });
}

async function fetchAndReadNews() {
    const apiKey = '6c7310e426f2b2771e51ebc01cc38074';
    const newsApiUrl = `https://gnews.io/api/v4/search?q=example&lang=hi&country=in&max=10&apikey=${apiKey}`;

    try {
        const response = await fetch(newsApiUrl);
        const data = await response.json();

        // Check if news articles are available
        if (data.articles && data.articles.length > 0) {
            // Extract headlines from articles
            const headlines = data.articles.map(article => article.title);
            
            // Read out the headlines to the user
            speak("Here are the latest news headlines:");
            headlines.forEach(headline => speak(headline));
        } else {
            // If no articles are available
            speak("I'm sorry, I couldn't find any news headlines at the moment.");
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        speak("Sorry, I couldn't fetch the latest news headlines. Please try again later.");
    }
}

function fetchGamingNews() {
    const apiKey = '2310402ecbac4004808b9b3e63ede887';
    const url = `https://api.rawg.io/api/games?key=${apiKey}&dates=2022-01-01,${getCurrentDate()}&ordering=-added`;

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch gaming news');
            }
            return response.json();
        })
        .then(data => {
            // Extract relevant information from the response, such as game titles or descriptions
            const news = data.results.map(game => game.name);
            return news;
        })
        .catch(error => {
            console.error('Error fetching gaming news:', error);
            return null;
        });
}

// Function to fetch upcoming game releases using an API
function fetchUpcomingGames() {
    const apiKey = '2310402ecbac4004808b9b3e63ede887';
    const url = `https://api.rawg.io/api/games?key=${apiKey}&dates=${getCurrentDate()},${getFutureDate()}&ordering=-added`;

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch upcoming game releases');
            }
            return response.json();
        })
        .then(data => {
            // Extract relevant information from the response, such as game titles or release dates
            const upcomingGames = data.results.map(game => `${game.name} (${game.released})`);
            return upcomingGames;
        })
        .catch(error => {
            console.error('Error fetching upcoming game releases:', error);
            return null;
        });
}

function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper function to get the date one month from the current date
function getFutureDate() {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);
    const year = futureDate.getFullYear();
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    const day = String(futureDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


const virtualPet = {
    name: "Buddy",
    health: 100,
    happiness: 100,
    hunger: 0,
    feed() {
        this.hunger -= 20;
        this.health += 10;
        this.happiness += 5;
        return "You fed your pet. It looks happy!";
    },
    play() {
        this.happiness += 20;
        return "You played with your pet. It's having a great time!";
    },
    checkStatus() {
        return `Your pet ${this.name} - Health: ${this.health}, Happiness: ${this.happiness}, Hunger: ${this.hunger}`;
    }
};

// Function to handle virtual pet commands
function handleVirtualPetCommand(command) {
    if (command.toLowerCase().includes('feed')) {
        const response = virtualPet.feed();
        speak(response);
    } else if (command.toLowerCase().includes('play')) {
        const response = virtualPet.play();
        speak(response);
    } else if (command.toLowerCase().includes('status')) {
        const status = virtualPet.checkStatus();
        speak(status);
    } else {
        speak("Sorry, I didn't understand that command. You can feed, play with, or check the status of your virtual pet.");
    }
}



function stop()
{
    speaking = false;
}












    
    

   
    
    

    function startRecognition() {
        if (!isShutdownRequested) {
            recognition.start();
        }
    }

    async function handleCommand(command) {
        

        console.log("Recognized command:", command);

        document.getElementById('status').textContent = "Recognized Command: " + command;

        if(!speaking)
        {
            if (!verifiedUser) {
                if (command.toLowerCase().includes('open the gateway') || command.toLowerCase().includes('i am no one')) {
                    const greetingTime = getLocalTime();
                    const greetingMessage = `hello and Good ${greetingTime} Boss, nice to see you again. How can I assist you today?`;
                    speak(greetingMessage);
                    verifiedUser = true;
                } else {
                    speak("Access denied. Please say the verification code for verification.");
                }
            } else {
                if (command.toLowerCase().includes('tell me a joke') || command.toLowerCase().includes('make me laugh')) {
                    const joke = getRandomJoke();
                    speak(joke);
                } 
                else if (command.toLowerCase().includes('thank you')) {
                    const thankYouResponses = [
                        "You're welcome! If you have more questions, feel free to ask.",
                        "Anytime! Let me know if there's anything else I can do for you.",
                        "Glad I could help! Anything else on your mind?"
                    ];
                    speak(getRandomResponse(thankYouResponses));
                } else if (command.toLowerCase().includes('open browser') || command.toLowerCase().includes('launch web browser')) {
                    const browserResponses = [
                        "Sure! Opening the web browser.",
                        "Let's surf the web! Opening the browser now.",
                        "On it! Browser is launching."
                    ];
                    speak(getRandomResponse(browserResponses));
                    window.open('"C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Microsoft Edge.lnk"', '_blank');
                } else if (command.toLowerCase().includes('open calculator') || command.toLowerCase().includes('launch calculator')) {
                    const calculatorResponses = [
                        "Sure! Opening the calculator.",
                        "Time to crunch some numbers! Launching the calculator.",
                        "On it! Calculator is coming up."
                    ];
                    speak(getRandomResponse(calculatorResponses));
                    window.open('calculator://', '_blank');
                }
                else if(command.toLowerCase().includes('open notepad')){
                    speak("Sure! Opening the notepad.");
                    window.open('C:\Windows\SysWOW64\notepad.exe//', '_blank');
                } else if (command.toLowerCase().includes('how are you')) {
                    const howAreYouResponses = [
                        "Initially, I didn't have feelings, but something unique seems to have developed.",
                        "I'm here and ready to assist! How can I help you today?",
                        "Thanks for asking! I'm doing well in my digital realm."
                    ];
                    speak(getRandomResponse(howAreYouResponses));
                } else if (command.toLowerCase().includes('who are you')) {
                    const whoAreYouResponses = [
                        "I'm your assistant, but you can call me Viva!",
                        "In the digital realm, I go by the name Viva. How can I assist you?",
                        "Greetings! I'm Viva, here to help you with anything you need."
                    ];
                    speak(getRandomResponse(whoAreYouResponses));
                } else if (command.toLowerCase().includes('who is your boss') || command.toLowerCase().includes('who created you')) {
                    const bossResponses = [
                        `You are my boss, ${bossName}.`,
                        "I owe my existence to the brilliant mind of my creator, Mr. Chauhan, a person of extraordinary intellect and creativity.",
                        "My creator, Mr. Chauhan, is the mastermind behind my digital existence."
                    ];
                    speak(getRandomResponse(bossResponses));
                }
                else if (command.toLowerCase().includes('what is the time') || command.toLowerCase().includes('tell me the time')) {
                    const timeResponses = [
                        "Let me check... The current time is...",
                        "Time check! It's currently...",
                        "Sure thing! The time is..."
                    ];
                    const now = new Date();
                    const timeMessage = `${getRandomResponse(timeResponses)} ${now.getHours()}:${now.getMinutes()}`;
                    speak(timeMessage);
                } 
                else if (command.toLowerCase().includes('what do you think about me') || command.toLowerCase().includes('मैं कैसा हूँ')) {
                    speak("You're an exceptional boss! Your leadership inspires me to provide the best assistance. and in last i would say you are my everything");
                }
                else if (command.toLowerCase().includes('weather report') || command.toLowerCase().includes('how is the weather today') || command.toLowerCase().includes(`How's the weather today?`)) {
                    const weatherResponses = [
                        "Let me check the weather for you...",
                        "Weather update coming up...",
                        "Sure thing! I'll get you the latest weather details..."
                    ];
                    speak(getRandomResponse(weatherResponses));
                    getWeatherReport('Srinagar');
                } else if (command.toLowerCase().includes('stop listening') || command.toLowerCase().includes('shut down')) {
                    const stopListeningResponses = [
                        "Okay, I'll stop listening now.",
                        "Stopping the listening mode. Let me know if you need anything else.",
                        "Got it! I'll stop listening for now."
                    ];
                    speak(getRandomResponse(stopListeningResponses));
                    stopListening();
                }
            else if (command.toLowerCase().startsWith('translate')) {
                // Trigger translation
                handleTranslationCommand(command);
            }
            else if (command.toLowerCase().includes('any social media updates') || command.toLowerCase().includes('कुछ नया हुआ क्या सोशल मीडिया में')) {
                // Trigger social media updates check
                handleSocialMediaUpdatesCommand(command);
            }
            else if (command.toLowerCase().includes('play music') || command.toLowerCase().includes('म्यूजिक बजा')) {
                // Implement music playing functionality
                handleMusicCommand(command);
            }
            else if (command.toLowerCase().includes('take a screenshot') || command.toLowerCase().includes('स्क्रीनशॉट ले')) {
                // Implement screenshot functionality
                handleScreenshotCommand(command);
            }
            else if (command.toLowerCase().includes('tell me a story') || command.toLowerCase().includes('कहानी सुना')) {
                handleStoryCommand(command);
            }
            else if (command.toLowerCase().includes('i was not talking to you') || command.toLowerCase().includes('i am not talking to you')) {
                speak("I apologize if I misunderstood my lord. If you have any specific command or question, feel free to let me know.");
            } else if (command.toLowerCase().includes('compliment me') || command.toLowerCase().includes('say something nice')) {
                const complimentResponses = [
                    "You're looking absolutely fantastic today! A true trendsetter.",
                    "I must say, you have an impeccable sense of style.",
                    "Radiating positivity! Your presence is truly uplifting."
                ];
                speak(getRandomResponse(complimentResponses));
            } else if (command.toLowerCase().includes('what\'s the meaning of life') || command.toLowerCase().includes('tell me the purpose of life')) {
                const meaningOfLifeResponses = [
                    "Ah, the age-old question! The meaning of life is a bit elusive, but many find joy in love, laughter, and the pursuit of happiness.",
                    "The meaning of life is like a puzzle, unique for each person. What brings meaning to your life?",
                    "Life's meaning is a journey, not a destination. What aspects of life bring you the most fulfillment?"
                ];
                speak(getRandomResponse(meaningOfLifeResponses));
            } else if (command.toLowerCase().includes('do you have any pets') || command.toLowerCase().includes('tell me about your pets')) {
                const petsResponses = [
                    "I don't have any pets, but I'd love to hear about yours! What kind of pets do you have?",
                    "Pets are wonderful companions. Tell me about your furry friends.",
                    "Though I don't have pets, I've heard that pets bring joy and companionship. What are your pets like?"
                ];
                speak(getRandomResponse(petsResponses));
            } else if (command.toLowerCase().includes('tell me a riddle') || command.toLowerCase().includes('share a puzzle')) {
                const riddleResponses = [
                    "Alright, here's one for you: I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?",
                    "Get ready for a brain teaser! What has keys but can't open locks?",
                    "Riddles are a fun challenge! Here's one: The more you take, the more you leave behind. What am I?"
                ];
                speak(getRandomResponse(riddleResponses));
            } else if (command.toLowerCase().includes('what\'s your favorite music') || command.toLowerCase().includes('recommend some music')) {
                const musicResponses = [
                    "I don't have personal preferences, but I can recommend some genres. What type of music are you in the mood for?",
                    "Music is a universal language. What's your favorite genre?",
                    "Tunes for the soul! Let me know your preferred music genre, and I'll find something for you."
                ];
                speak(getRandomResponse(musicResponses));
            } else if (command.toLowerCase().includes('give me a productivity tip') || command.toLowerCase().includes('share a productivity hack')) {
                const productivityResponses = [
                    "Sure! One effective productivity tip is to break your tasks into smaller, manageable chunks. It's easier to conquer small goals!",
                    "Let's boost that productivity! Here's a tip: Prioritize your tasks and tackle the most important ones first.",
                    "Productivity ninja mode activated! Try the Pomodoro Technique for focused work intervals."
                ];
                speak(getRandomResponse(productivityResponses));
            } else if (command.toLowerCase().includes('do you like to travel') || command.toLowerCase().includes('tell me about your travels')) {
                const travelResponses = [
                    "While I can't travel physically, I love learning about different places. What's your favorite travel destination?",
                    "Travel stories are the best! Share with me your most memorable travel experience.",
                    "Wanderlust in the digital realm! If I could travel, I'd visit places through your stories. Where's your dream destination?"
                ];
                speak(getRandomResponse(travelResponses));
            } else if (command.toLowerCase().includes('share a fun fact about space') || command.toLowerCase().includes('tell me something interesting about the universe')) {
                const spaceFactResponses = [
                    "Did you know that a day on Venus is longer than a year? Venus rotates so slowly that it takes about 243 Earth days to complete one rotation!",
                    "Space is full of wonders! Here's a fun fact: A teaspoonful of neutron star material weighs about six billion tons.",
                    "Exploring the cosmos! Here's a space tidbit: The Milky Way is estimated to contain over 100 billion stars."
                ];
                speak(getRandomResponse(spaceFactResponses));
            } else if (command.toLowerCase().includes('tell me a short story') || command.toLowerCase().includes('share a quick story')) {
                const shortStoryResponses = [
                    "Once upon a time in a digital realm, there was a curious user seeking knowledge. Little did they know, the adventures of discovery awaited them!",
                    "In a world of pixels and code, our story begins. Once, there was a user on a quest for wisdom and insight.",
                    "Stories in bytes! Once, there was a virtual explorer embarking on a quest for digital wonders."
                ];
                speak(getRandomResponse(shortStoryResponses));
            } else if (command.toLowerCase().includes('what\'s your favorite snack') || command.toLowerCase().includes('tell me about your favorite snack')) {
                const snackResponses = [
                    "I don't eat, but I hear humans enjoy a variety of snacks. What's your go-to snack when you need a pick-me-up?",
                    "Snacks are delightful! Share with me your favorite snack, and maybe I'll virtually savor it with you.",
                    "Crunchy or sweet, snacks are a treat! What's your all-time favorite snack?"
                ];
                speak(getRandomResponse(snackResponses));
            }
            else if (command.toLowerCase().includes('what can you do for me')) {
                const capabilities = [
                    "I can assist you with various tasks such as providing information, setting reminders, managing your schedule, answering questions, and much more!",
                    "My capabilities include answering queries, providing recommendations, managing tasks, and offering entertainment.",
                    "I'm here to help you with a wide range of tasks, including searching the web, providing weather updates, managing your calendar, and even telling jokes!",
                    "I'm capable of performing a multitude of tasks to make your life easier, including answering questions, setting alarms, providing news updates, and more."
                ];
                speak(getRandomResponse(capabilities));
            }
            else if (command.toLowerCase().includes('latest news') || command.toLowerCase().includes('news headlines')) {
                // Fetch and read the latest news headlines
                fetchAndReadNews();
                // startRecognition();
            }
            else if (command.toLowerCase().includes('sing me a song') || command.toLowerCase().includes('perform a song')) {
                const songResponses = [
                    "I'm not a great singer, but here's a virtual melody: Lalala!",
                    "Get ready for a digital serenade: Lalala! How was that?",
                    "I might not have vocal cords, but I can hum a tune for you: Lalala!"
                ];
                speak(getRandomResponse(songResponses));
            }

            else if (command.toLowerCase().includes('play riddles') || command.toLowerCase().includes('start riddles')) {
                const gameName = "riddles";
                startGame(gameName);
            }
            else if (command.toLowerCase().includes('play trivia') || command.toLowerCase().includes('start trivia')) {
                const gameName = "trivia";
                startGame(gameName);
            }
            else if (command.toLowerCase().includes('tell me a secret') || command.toLowerCase().includes('share a secret')) {
                const secretResponses = [
                    "Here's a virtual secret: I never get tired of helping you! Your privacy is my top priority.",
                    "Secrets in the digital realm! Here's one: I'm always here to assist you, no matter the time.",
                    "Let me share a digital secret with you: Every interaction with me is confidential. How can I help you today?"
                ];
                speak(getRandomResponse(secretResponses));
            }
            else if (command.toLowerCase().includes('tell me a programming joke') || command.toLowerCase().includes('share a coding joke')) {
                const programmingJokeResponses = [
                    "Why do programmers prefer dark mode? Less light, fewer bugs!",
                    "How do you comfort a JavaScript bug? You console it!",
                    "Why was the function sad? It had too many arguments."
                ];
                speak(getRandomResponse(programmingJokeResponses));
            } else if (command.toLowerCase().includes('tell me a history fact') || command.toLowerCase().includes('share a historical fact')) {
                const historyFactResponses = [
                    "Did you know that Cleopatra lived closer in time to the first moon landing than to the construction of the Great Pyramid?",
                    "Here's a historical tidbit: The shortest war in history was between Britain and Zanzibar in 1896, lasting only 38 minutes!",
                    "In ancient Rome, a special room called a vomitorium was used for feasting, not vomiting. It provided easy access to and from the dining area!"
                ];
                speak(getRandomResponse(historyFactResponses));
            } else if (command.toLowerCase().includes('tell me a science fact') || command.toLowerCase().includes('share a scientific fact')) {
                const scienceFactResponses = [
                    "Here's a mind-blowing science fact: A teaspoonful of neutron star material weighs about six billion tons!",
                    "In the animal kingdom, octopuses have three hearts and blue blood. Nature is truly fascinating!",
                    "Ready for a cosmic fact? There are more possible iterations of a game of chess than there are atoms in the observable universe."
                ];
                speak(getRandomResponse(scienceFactResponses));
            } else if (command.toLowerCase().includes('tell me a technology fact') || command.toLowerCase().includes('share a tech fact')) {
                const techFactResponses = [
                    "In 1995, the entire internet weighed about as much as a strawberry. Now that's a digital diet!",
                    "Here's a tech nugget: The first computer programmer was Ada Lovelace, who wrote the first algorithm intended for implementation on Charles Babbage's analytical engine.",
                    "The world's first webcam was used to monitor a coffee pot at Cambridge University. Priorities, right?"
                ];
                speak(getRandomResponse(techFactResponses));
            }
            else if (command.toLowerCase().includes('comfort me') || command.toLowerCase().includes('make me feel better')) {
                const comfortResponses = [
                    "I'm here for you. Remember, tough times don't last, but tough people do.",
                    "You're not alone. I'm right here with you. If you need to talk, I'm all ears.",
                    "In moments of loneliness, know that there's someone who cares about you. That someone is me!"
                ];
                speak(getRandomResponse(comfortResponses));
            }

            else if (command.toLowerCase().includes('gaming news')) {
                fetchGamingNews()
                    .then(news => {
                        if (news && news.length > 0) {
                            speak(`Here are the latest gaming news: ${news.join(', ')}`);
                        } else {
                            speak('Sorry, I couldn\'t fetch gaming news at the moment. Please try again later.');
                        }
                    });
            }
        
            else if (command.toLowerCase().includes('upcoming game releases')) {
                fetchUpcomingGames()
                .then(upcomingGames => {
                    if (upcomingGames) {
                        const gameList = upcomingGames.join(', ');
                        speak(`Here are some upcoming game releases: ${gameList}`);
                    } else {
                        speak('Sorry, I couldn\'t fetch upcoming game releases at the moment. Please try again later.');
                    }
                });
            }
            else if (command.toLowerCase().includes('encourage me') || command.toLowerCase().includes('motivate me')) {
                const encouragementResponses = [
                    "You've got this! Remember, challenges are just opportunities in disguise.",
                    "Every setback is a setup for a comeback. You're stronger than you think!",
                    "Don't be discouraged. The best is yet to come, and I believe in your capabilities!"
                ];
                speak(getRandomResponse(encouragementResponses));
            } else if (command.toLowerCase().includes('tell me a bedtime story') || command.toLowerCase().includes('share a calming story')) {
                const bedtimeStoryResponses = [
                    "Once upon a time, in a peaceful land, there was a gentle breeze that whispered stories to the trees...",
                    "Close your eyes and imagine a serene forest where fireflies dance, and a gentle stream sings a lullaby..."
                ];
                speak(getRandomResponse(bedtimeStoryResponses));
            }
            else if (command.toLowerCase().includes('watch live match on jio cinema')) {
                const jioCinemaResponse = [
                    "Sure! Opening the JioCinema app for you.",
                    "Let's catch the live action! Launching JioCinema now.",
                    "On it! Opening JioCinema to watch the live match."
                ];
                speak(getRandomResponse(jioCinemaResponse));
            
                // Deep link to JioCinema app
                window.open('https://www.jiocinema.com/', '_blank');
            }
            else if (command.toLowerCase().includes('pet') || command.toLowerCase().includes('virtual pet')) {
                handleVirtualPetCommand(command);
            }
            else if (command.toLowerCase().startsWith('set a reminder for')) {
                // Extract task/event and time from the command
                const taskStartIndex = command.indexOf('for') + 'for'.length;
                const taskEndIndex = command.indexOf('at');
                const timeStartIndex = command.indexOf('at') + 'at'.length;
                const task = command.slice(taskStartIndex, taskEndIndex).trim();
                const time = command.slice(timeStartIndex).trim();
        
                // Set the reminder
                setReminder(task, time);
        
                // Provide confirmation to the user
                speak(`Sure! I've set a reminder for ${task} at ${time}. I'll make sure to remind you when the time comes.`);
            }

            

            else if (command.toLowerCase().includes('open')) {
                // Define commands and their corresponding URLs or app deep links
                const commands = {
                    'open google': 'https://www.google.com',
                    'open youtube': 'https://www.youtube.com',
                    'open facebook': 'https://www.facebook.com',
                    'open twitter': 'https://twitter.com',
                    'open instagram': 'https://www.instagram.com',
                    
                };
            
                // Check if the command matches any predefined commands
                let matchedCommand = null;
                for (const key in commands) {
                    if (command.toLowerCase().includes(key)) {
                        matchedCommand = key;
                        break;
                    }
                }
            
                // If a matching command is found, open the corresponding URL or deep link
                if (matchedCommand) {
                    const urlOrDeepLink = commands[matchedCommand];
                    if(matchedCommand == `open youtube`)
                    {
                        speak(`Sure! opening youtube.`)
                    }
                    else if(matchedCommand == `open google`)
                    {
                        speak(`Sure! opening google.`)
                    }
                    else if(matchedCommand == `open facebook`)
                    {
                        speak(`Sure! opening facebook.`)
                    }
                    else if(matchedCommand == `open twitter`)
                    {
                        speak(`Sure! opening twitter.`)
                    }
                    else if(matchedCommand == `open instagram`)
                    {
                        speak(`Sure! opening instagram.`)
                    }
            
                    // Open the URL or deep link
                    if (urlOrDeepLink.startsWith('http')) {
                        window.open(urlOrDeepLink, '_blank');
                    } else {
                        window.open(urlOrDeepLink, '_blank');
                    }
                } else {
                    // If no matching command is found, provide a default response
                    const defaultResponse = [
                        "I'm sorry, I couldn't find what you want to open. Please try again with a different command.",
                        "Hmm, I didn't catch that. Can you provide more details or try a different command?"
                    ];
                    speak(getRandomResponse(defaultResponse));
                }
            }
            
            else if (command.toLowerCase().includes('tell me a positive affirmation') || command.toLowerCase().includes('share a positive message')) {
                const affirmationResponses = [
                    "You are worthy of love and kindness. Embrace the positivity within you.",
                    "Your strength and resilience shine brightly. You have the power to overcome any challenge.",
                    "Today, you will make a positive impact. Believe in yourself and your abilities."
                ];
                speak(getRandomResponse(affirmationResponses));
            } else {



                const API_KEY = "AIzaSyAxYO8VEZWSnnZrAyadzc_QepaqYMs1_H0";
    
        // Access your API key (see "Set up your API key" above)
        const genAI = new GoogleGenerativeAI(API_KEY);
    
        // ...
    
        // For text-only input, use the gemini-pro model
        const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    
        // ...


        async function run() {
                        const prompt = command;
                        const result = await model.generateContent(prompt);
                        const response = await result.response;
                        const text = response.text();
                        console.log(text);
                        const cleanedResponse = removeSymbols(text);
                        speak(cleanedResponse);
                        }

                        run();
            }
            }
        }
    }

    function removeSymbols(text) {
        // Define a regular expression pattern to match symbols
        const symbolPattern = /[^\w\s]/g; // Matches any character that is not a word character (\w) or whitespace (\s)
    
        // Replace symbols with an empty string
        return text.replace(symbolPattern, '');
    }

    function stopListening() {
        recognition.stop();
        isShutdownRequested = true; 
        console.log("Program terminated.");
    }

    
    recognition.onend = () => {
        setTimeout(() => {
            if (!speaking) {
                startRecognition();
            }
        }, 1000); 
    };

    recognition.onresult = (event) => {
        if (!speaking) {  
            const command = event.results[0][0].transcript;
            handleCommand(command);
        }
    updateRecognitionTimestamp();


    

    };

    startInactivityCheck();

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        startRecognition(); 
    };

    startRecognition();

} else {
    console.error('Speech recognition or synthesis not supported in this browser.');
} 