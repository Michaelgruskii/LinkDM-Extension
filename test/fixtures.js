// Real Apollo blob examples from Michael Gruskin's sequences.
// Three different InMail subject formats — all three must parse correctly.

const blob1 = `Message 1:
hey {{contact.first_name}} thanks for connecting!
Message 2:
saw you checked out our brand campaigns list - any names on there that caught you off guard? some of them i wouldnt have expected myself haha

Inmail:
the campaigns list

I saw you downloaded our brand campaigns list and wanted to reach out - any names on there that caught you off guard? some of them i wouldnt have expected myself haha`;

const blob2 = `Message 1:
hey {{contact.first_name}} thanks for connecting!
Message 2:
do you happen to be heading to Mad//Fest? we're actually going to be on stage there with GiffGaff talking about attention in digital advertising, would love to find some time to connect in person while we're all there!

InMail
Subject: quick one

hey {{contact.first_name}} - do you happen to be heading to Mad//Fest? our team is going to be there and we're actually joining GiffGaff on stage for a conversation around attention in digital advertising. would love to find some time to connect while we're all in the same place!`;

const blob3 = `Message 1:
hey {{contact.first_name}} thanks for connecting!
Message 2:
curious whether {{account.name}} has looked into bringing its IP into gaming at all or if it's still more of an early conversation?

Inmail:{{account.name}} x gaming

hey {{contact.first_name}} - curious whether getting {{account.name}}'s IP in front of gaming audiences is something that's come up yet?`;

module.exports = { blob1, blob2, blob3 };
