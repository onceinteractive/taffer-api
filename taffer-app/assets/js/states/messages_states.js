angular.module("taffer.app")
.config([
	"$stateProvider",
	function(stateProvider) {
		stateProvider.state("Main.Messages", {
			abstract: true,
			url: "/messages",
			views: {
				"messages": {
					template: '<div id="l-messages" class="view" ui-view></div>',
					controller: "MessageCtrl",
					resolve: {
						RECIPIENTS: ["MessageService", function(messageService) {
							return messageService.getMessageRecipients().catch(function() {
								return [];
							});
						}],
						SUGGESTIONS: ["SuggestionService", function(suggestionService) {
							return suggestionService.getSuggestions().catch(function() {
								return [];
							});
						}]
					}
				}
			}
		})

		.state("Main.Messages.List", {
			url: "/messagesList?tab",
			templateUrl: "views/main/messages/messages_list.html",
			controller: "MessageListCtrl"
		})

		.state("Main.Messages.NewMessage", {
			url: "/newMessage?userId&firstName&lastName",
			templateUrl: "views/main/messages/new_message.html",
			controller: "NewMessageCtrl"
		})

		.state("Main.Messages.NewSuggestion", {
			url: "/newSuggestion",
			templateUrl: "views/main/messages/new_suggestion.html",
			controller: "NewSuggestionCtrl"
		})

		.state("Main.Messages.ViewConversation", {
			url: "/viewConversation?index",
			templateUrl: "views/main/messages/view_conversation.html",
			controller: "ConversationCtrl"
		})

		.state("Main.Messages.ViewSuggestion", {
			url: "/viewSuggestion?suggestionId",
			templateUrl: "views/main/messages/suggestion_view.html",
			controller: "ViewSuggestionCtrl"
		});
	}
]);
