---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
lastmod: {{ .Date }}
draft: true
description: ""
author: "Admin"

# Event details
event_date: {{ .Date }}
event_end_date: {{ .Date }}
event_location: ""
event_url: ""
registration_url: ""

# Taxonomy
categories: ["Event"]
tags: []

# Visuals
image: "images/default-hero.jpg"
images: ["images/default-hero.jpg"]
image_caption: ""

# Features
toc: false
comments: false
---

