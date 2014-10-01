angular.module("taffer.services")
.value("STEPS", {
	sales: {
		view: {
			steps: [
				{  intro: "Welcome to Sales!\n\nHere, you can enter and analyze your Sales and Customer Trends by week, month, or year."  },
				{
					element: "#step1",
					intro: "Your TOTAL SALES trends are automatically charted on the graph!",
					position: "bottom-middle-aligned",
				},
				{
					element: "#step2",
					intro: "Choose WEEKLY, MONTHLY, or YEARLY to change the scope of the graph.",
					position: "bottom-middle-aligned",
				},
				{
					element: "#step3",
					intro: "Use the arrow buttons to change the graph from sales to customer trends.",
					position: "bottom-middle-aligned",
				},
				{
					element: "#step4",
					intro: "If you want to see even more helpful statistics, tap the TRENDS button.",
					position: "bottom",
				},
				{
					element: "#step5",
					intro: "The first thing you need to do is input some numbers through this EDIT tab!",
					position: "bottom-right-aligned",
				}
			],
			tooltipClass: "fusion-tooltip",
			scrollToElement: false
		},
		edit: {
			steps: [
				{  intro: "Welcome to the Edit Sales tab!\n\nHere, you enter data for the application to chart for you."  },
				{  intro: "First, choose the day for which you are entering data from the calendar."  },
				{
					element: ".m-sales-edit-form",
					intro: "Then, fill out sales, guest count, staff scheduled count, and hours of operation.",
					position: "top",
				},
				{
					element: "#blade-save",
					intro: "Finally, tap 'Save' in the top right corner. The app will do the rest!",
					position: "bottom-right-aligned",
				}
			],
			tooltipClass: "fusion-tooltip",
			scrollToElement: false
		},
		trends: {
			steps: [
				{  intro: "Here, you can see your best days, worst days, and sales averages." }
			],
			tooltipClass: "fusion-tooltip",
			scrollToElement: false
		}
	},
	messages: {
		owner: {
			list: {
				steps: [
					{  intro: "Welcome to the Messages page!\n\nHere, you can see messages you have received and send messages! And, as a manager, you can receive anonymous feedback from employees."  },
					{
						element: "#step1",
						intro: "Tap INBOX to view your messages. Tap on a Message to read it.",
						position: "bottom",
					},
					{
						element: "#step2",
						intro: "Tap SUGGESTIONS to view anonymous feedback from your employees. This can be extremely beneficial for you and your business!",
						position: "bottom-right-aligned",
					},
					{
						element: ".step3",
						intro: "To create a new message, tap the icon on the lower-right.",
						position: "top",
					}
				],
				tooltipClass: "fusion-tooltip",
				scrollToElement: false
			}
		},
		staff: {
			list: {
				steps: [
					{  intro: "Welcome to Messages!\n\nHere, you can view messages from managers, as well as submit anonymous feedback to your bar’s owners and managers."  },
					{
						element: "#step1",
						intro: "Tap INBOX to view your messages... Tap on a Message to read it.",
						position: "bottom-left-aligned",
					},
					{
						element: "#step2",
						intro: "Tap SUGGESTIONS to submit anonymous feedback!",
						position: "bottom-right-aligned",
					},
					{
						element: ".step3",
						intro: "To create a new message, tap the icon on the lower-right.",
						position: "top",
					}
				],
				tooltipClass: "fusion-tooltip",
				scrollToElement: false
			}
		}
	},
	preshift: {
		view: {
			manager: {
				steps: [
					{  intro: "Welcome to Pre-Shift!\n\nThis page allows you to provide staff with information they may need to know before a specific shift.\n\nUse the Pre-Shift page to help coordinate theme nights, promotions and more!"  },
					{  intro: "Here, you can also view all prior pre-shift messages."  },
					{  intro: "Tap the plus button in the top right to create a new pre-shift message."  }
				],
				tooltipClass: "fusion-tooltip",
				scrollToElement: false
			},
			staff: {
				steps: [
					{  intro: "Welcome to Pre-Shift!\n\nBar Managers use Pre-Shift to provide you with helpful information before your specific shifts.\n\nThis can help streamline theme nights, promotions and more.\n\nTap any pre-shift message to view."  },
				],
				tooltipClass: "fusion-tooltip",
				scrollToElement: false
			}
		},
		edit: {
			manager: {
				steps: [
					{
						element: "#l-preshift-add-icon",
						intro: "Tap the Plus button to add employees as recipients of the pre-shift message.",
						position: "bottom-right-aligned"
					},
					{
						element: "#l-preshift-message",
						intro: "Enter your message and title to be sent to your chosen employees.",
						position: "top-aligned"
					},
					{
						element: "#blade-save",
						intro: "Finally, hit save in the top-right corner to send the pre-shift message!",
						position: "bottom-right-aligned"
					},
				],
				tooltipClass: "fusion-tooltip",
				scrollToElement: false
			}
		}
	},
	scheduler: {
		overview: {
			manager: {
				steps: [
					{  intro: "Welcome to the Scheduler! Here, you can set weekly schedules.\n\nStaff can view schedules and request shift changes."  },
					{
						element: ".sch-footer-nav",
						intro: "Use the SCHEDULE tab to view and assign staff to weekly shifts.",
						position: "bottom-left-aligned"
					},
					{
						element: ".sch-footer-nav",
						intro: "The EVENTS tab displays a calendar of scheduled promotions and events.",
						position: "bottom-middle-aligned"
					},
					{
						element: ".sch-footer-nav",
						intro: "The REQUESTS tab allows you to approve or decline shift requests. You may also submit your own requests.",
						position: "bottom-right-aligned"
					}
				],
				tooltipClass: "fusion-tooltip",
				scrollToElement: false
			},
			staff: {
				steps: [
					{  intro: "Welcome to the Scheduler!\n\nHere, you can view your team's schedule and request shift changes!"  },
					{
						element: ".sch-footer-nav",
						intro: "Use the SCHEDULE tab to view your weekly shifts.",
						position: "bottom-left-aligned"
					},
					{
						element: ".sch-footer-nav",
						intro: "The EVENTS tab displays a celendar of scheduled promotions and events.",
						position: "bottom-middle-aligned"
					},
					{
						element: ".sch-footer-nav",
						intro: "The REQUESTS tab allows you to submit Time Off and Shift Swap requests.",
						position: "bottom-right-aligned"
					}
				],
				tooltipClass: "fusion-tooltip",
				scrollToElement: false
			}
		},
		requests: {
			manager: {
				steps: [
					{  intro: "Welcome to the REQUESTS tab!\n\nHere, you can see Pending, Approved, or Declined shift requests."  },
					{
						element: "#step1",
						intro: "At each tab, you have the option to View All, view only Shift Swaps, or view only Time Off requests.",
						position: "bottom",
					},
					{  intro: "Tap the 'Plus' in the top right to submit your own request!"  }
				],
				tooltipClass: "fusion-tooltip",
				scrollToElement: false
			},
			staff: {
				steps: [
					{  intro: "Here, you can see Pending, Approved, or Declined shift requests."  },
					{  intro: "To create a new request, tap the Plus button in the top right."  }
				],
				tooltipClass: "fusion-tooltip",
				scrollToElement: false
			}
		}
	},
	myTeam: {
		manager: {
			steps: [
				{  intro: "Welcome to My Team!\n\nHere, you can view team members and add new employees."  },
				{
					element: "#l-myteam-container",
					intro: "Tap a team member to view and edit their profile.",
					position: "bottom-middle-aligned"
				},
				{  intro: "Tap the Plus button in the top right to invite a new team member through text message or email."  }
			],
			tooltipClass: "fusion-tooltip",
			scrollToElement: false
		},
		staff: {
			steps: [
				{  intro: "Welcome to My Team! Here, you can view your fellow team members' profiles by tapping on them!"  }
			],
			tooltipClass: "fusion-tooltip",
			scrollToElement: false
		}
	},
	promotions: {
		scheduled: {
			manager: {
				steps: [
					{  intro: "Welcome to the Promotions page!\n\nUtilizing this page can greatly boost both your guest counts and sales!"  },
					{
						element: ".m-promotions-btn-container",
						intro: "To schedule a promotion, you may choose from a list of existing promotions or create your own.\n\nWe suggest trying a pre-made promotion first.",
						position: "bottom-middle-aligned",
					},
					{
						element: "#step2",
						intro: "Already scheduled promotions are displayed here. They may be edited and deleted by selecting the icons on the right side!",
						position: "top",
					}
				],
				tooltipClass: "fusion-tooltip",
				scrollToElement: false
			}
		},
		list: {
			manager: {
				steps: [
					{  intro: "Here, you can choose from pre-made promotions to host at your venue!"  },
					{  intro: "Tap the Arrow on the left side of the promotion to view details."  },
					{  intro: "Tap the Plus on the right side of the promotion to schedule it."  }
				],
				tooltipClass: "fusion-tooltip",
				scrollToElement: false
			}
		},
		create: {
			manager: {
				steps: [
					{  intro : "Welcome to the promotion customization view!\n\nHere, you can customize and schedule your promotion!"  },
					{
						element: "#step2",
						intro: "You can set the TITLE...",
						position: "bottom-middle-aligned",
					},
					{
						element: "#step3",
						intro: "DESCRIPTION...",
						position: "bottom-middle-aligned",
					},
					{
						element: "#step4",
						intro: "and DATE & TIME of the promotion.",
						position: "top",
					},
					{
						element: "#step5",
						intro: "SET PROMOTION WINDOW allows you to schedule a recurring promotion within a selected date range.",
						position: "top",
					},
					{
						element: "#step6",
						intro: "Confirm your promotion by tapping here!",
						position: "top",
					}
				],
				tooltipClass: "fusion-tooltip",
				scrollToElement: true
			}
		},
		social: {
			manager: {
				steps: [
					{  intro: "You now have the option to share your new promotion on Facebook or Twitter!"  },
					{
						element: "#step1",
						intro: "Write the post message!",
						position: "bottom-middle-aligned"
					},
					{
						element: "#step2",
						intro: "Select images...",
						position: "top"
					},
					{
						element: "#step3",
						intro: "And choose a date and time to post the announcement.",
						position: "top"
					}
				],
				tooltipClass: "fusion-tooltip",
				scrollToElement: true

			}
		}
	},
	logbook: {
		steps: [
			{  intro: "Welcome to the Log Book!\n\nThis is a great resource for Managers to communicate with one another!"  },
			{  intro: "To submit a new Log Book entry, tap the Plus button in the top right."  },
			{
				element: "#l-logbook-search",
				intro: "Also, you can view past entries by using the search function.",
				position: "bottom-middle-aligned"
			},
			{  intro: "Tap the logbook message itself to view.\n\nIn the view, you can reply to the message or add an image!"}
		],
		tooltipClass: "fusion-tooltip",
		scrollToElement: true
	},
	profile: {
		manager: {
			steps: [
				{  intro: "Welcome to your profile! You can edit your account information here."  },
				{
					element: "#step1",
					intro: "Adjust your personal info such as name, email, and password.",
					position: "top"
				},
				{
					element: "#step2",
					intro: "Link your personal social media accounts.",
					position: "top"
				},
				{
					element: "#l-myprofile-avatar",
					intro: "Change your profile picture by tapping this icon.",
					position: "bottom-middle-aligned"
				},
				{
					element: "#step4",
					intro: "Change your bar's information. Simply tap the field you wish to change.",
					position: "top"
				},
				{  intro: "Tap 'Save' in the top right corner when you're done!"  }
			],
			tooltipClass: "fusion-tooltip",
			scrollToElement: true
		},
		staff: {
			steps: [
				{  intro: "Welcome to your profile! You can edit your account information here."  },
				{
					element: "#step2",
					intro: "Adjust your personal info such as name, email, and password.",
					position: "top"
				},
				{
					element: "#l-myprofile-avatar",
					intro: "Change your profile picture by tapping this icon.",
					position: "bottom-middle-aligned"
				},
				{  intro: "Tap 'Save' in the top right corner when you're done!"  }
			],
			tooltipClass: "fusion-tooltip",
			scrollToElement: true
		}
	},
	courses: {
		manager: {
			steps: [
				{  intro: "Welcome to COURSES!\n\nAs a manager, you are able to see all available courses."  },
				{  intro: "Tap on a course preview to view the course.\n\nOnce in the course view, you can watch the course video, take the quiz, then share the course with your staff!"  }
			],
			tooltipClass: "fusion-tooltip",
			scrollToElement: false
		},
		staff: {
			steps: [
				{  intro: "Welcome to COURSES!\n\nHere, you can see courses that your manager has chosen to share with the team."  },
				{  intro: "Tap a course preview to view the it.\n\nOnce in the course view, you can watch the course video and take the quiz to earn badges!"  }
			],
			tooltipClass: "fusion-tooltip",
			scrollToElement: false
		}
	},
	qa: {
		main: {
			steps: [
				{  intro: "Welcome to Q&A WITH JON TAFFER!\n\nThis is an outlet for you to see Jon Taffer's response to questions submitted by bar managers from all over!  You can also submit your own questions!"  },
				{  intro: "Tap a question to view the response from Jon. If you wish to submit your own, tap the Plus in the top right corner!"  }
			],
			tooltipClass: "fusion-tooltip",
			scrollToElement: false
		},
		create: {
			steps: [
				{  intro: "Welcome to the NEW QUESTION Tab! Here, you can submit a question to Jon.  If you have push notifications enabled, you will be notified when it is answered!"  }
			],
			tooltipClass: "fusion-tooltip",
			scrollToElement: false
		}
	}
});
